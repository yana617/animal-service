import request from 'supertest';
import nock from 'nock';
import { v4 } from 'uuid';

import { app } from '../fixtures/setup';
import { generateAnimal, generatePlatform } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { platformRepository } from '../../repositories/platform.repository';
import { ERRORS } from '../../translates';
import { adRepository } from '../../repositories/ad.repository';
import { animalRepository } from '../../repositories/animal.repository';

describe('POST /ads request', () => {
    afterEach(async () => {
        await adRepository.deleteAll();
        await platformRepository.deleteAll();
        await animalRepository.deleteAll();

        nock.cleanAll();
    });

    it('successful ad creation', async () => {
        const userId = v4();

        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/users/me')
            .reply(200, {
                success: true,
                data: { id: userId, role: 'USER' },
            });

        const animal = await animalRepository.create(generateAnimal());
        const platform = await platformRepository.create(generatePlatform());
        const date = new Date().toISOString();

        const requestBody = {
            animal_id: animal.id,
            platform_id: platform.id,
            date,
        };

        const response = await request(app)
            .post('/ads')
            .set('x-access-token', 'valid token')
            .send(requestBody);

        const { data: ad } = response.body;

        expect(response.body.success).toBe(true);
        expect(ad).toMatchObject({
            user_id: userId,
            date: new Date(date).toISOString(),
            animal: expect.objectContaining({
                id: animal.id,
                name: animal.name,
            }),
            platform: expect.objectContaining({
                id: platform.id,
                name: platform.name,
            }),
        });

        const ads = await adRepository.getAll();
        expect(ads).toHaveLength(1);
    });

    test('Should fail with auth error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        const response = await request(app)
            .post('/ads')
            .set('x-access-token', 'valid token')
            .send({});

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.AUTH_REQUIRED);
    });

    it('should return validation error when required fields are missing', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const response = await request(app)
            .post('/ads')
            .set('x-access-token', 'valid token')
            .send({})
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors).toContainEqual(
            expect.objectContaining({
                type: 'field',
                msg: expect.any(String),
            }),
        );
    });

    it('should return validation error when date format is invalid', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const animal = await animalRepository.create(generateAnimal());
        const platform = await platformRepository.create(generatePlatform());

        const requestBody = {
            user_id: v4(),
            animal_id: animal.id,
            platform_id: platform.id,
            date: 'invalid-date',
        };

        const response = await request(app)
            .post('/ads')
            .set('x-access-token', 'valid token')
            .send(requestBody)
            .expect(400);

        expect(response.body.success).toBe(false);
    });

    it('should return 404 when platform does not exist', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/users/me')
            .reply(200, {
                success: true,
                data: { id: v4(), role: 'USER' },
            });

        const animal = await animalRepository.create(generateAnimal());
        const nonExistentPlatformId = '00000000-0000-0000-0000-000000000000';

        const requestBody = {
            user_id: v4(),
            animal_id: animal.id,
            platform_id: nonExistentPlatformId,
            date: new Date().toISOString(),
        };

        const response = await request(app)
            .post('/ads')
            .set('x-access-token', 'valid token')
            .send(requestBody)
            .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.PLATFORM_NOT_FOUND);
    });

    it('should return 404 when animal does not exist', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/users/me')
            .reply(200, {
                success: true,
                data: { id: v4(), role: 'USER' },
            });

        const platform = await platformRepository.create(generatePlatform());
        const nonExistentAnimalId = '00000000-0000-0000-0000-000000000000';

        const requestBody = {
            user_id: v4(),
            animal_id: nonExistentAnimalId,
            platform_id: platform.id,
            date: new Date().toISOString(),
        };

        const response = await request(app)
            .post('/ads')
            .set('x-access-token', 'valid token')
            .send(requestBody)
            .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.ANIMAL_NOT_FOUND);
    });
});
