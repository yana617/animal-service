import request from 'supertest';
import nock from 'nock';

import { animalRepository } from '../../../repositories/animal.repository';
import { app } from '../../fixtures/setup';
import { generateAnimal } from '../../fixtures/db';
import { BASE_URL } from '../../fixtures/constants';
import { ERRORS } from '../../../translates';
import { AnimalType } from '../../../database/models/animal';

describe('POST /animals request - errored', () => {
    beforeEach(async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });
    });

    afterEach(async () => {
        nock.cleanAll();
        await animalRepository.deleteAll();
    });

    test('Should fail with validation error (curator_id uuid)', async () => {
        const animalOne = await animalRepository.create(
            generateAnimal({ type: AnimalType.DOG }),
        );

        const response = await request(app)
            .patch(`/animals/${animalOne.id}`)
            .set('x-access-token', 'valid token')
            .send({ ...animalOne, curator_id: 'not uuid' })
            .expect(400);

        const { errors } = response.body;
        expect(errors).toBeDefined();
    });

    test('Should fail with validation error (place enum)', async () => {
        const animalOne = await animalRepository.create(
            generateAnimal({ type: AnimalType.DOG }),
        );

        const response = await request(app)
            .patch(`/animals/${animalOne.id}`)
            .set('x-access-token', 'valid token')
            .send({ ...animalOne, place: 'invalid' })
            .expect(400);

        const { errors } = response.body;
        expect(errors).toBeDefined();
    });

    test('Should fail with validation error (height for dogs required)', async () => {
        const animalOne = await animalRepository.create(
            generateAnimal({ type: AnimalType.DOG }),
        );

        const response = await request(app)
            .patch(`/animals/${animalOne.id}`)
            .set('x-access-token', 'valid token')
            .send({ ...animalOne, height: undefined })
            .expect(400);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.DOG_HEIGHT_REQUIRED);
    });

    test('Should fail with validation error (status enum)', async () => {
        const animalOne = await animalRepository.create(
            generateAnimal({ type: AnimalType.DOG }),
        );

        const response = await request(app)
            .patch(`/animals/${animalOne.id}`)
            .set('x-access-token', 'valid token')
            .send({ ...animalOne, status: 'invalid' })
            .expect(400);

        const { errors } = response.body;
        expect(errors).toBeDefined();
    });

    test('Should fail with auth error', async () => {
        nock.cleanAll();
        nock(BASE_URL).get('/auth').reply(401, { success: false });
        const animalOne = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .patch(`/animals/${animalOne.id}`)
            .set('x-access-token', 'valid token')
            .send(animalOne)
            .expect(401);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.AUTH_REQUIRED);
    });

    test('Should fail with permissions error', async () => {
        nock.cleanAll();
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: [] });
        const animalOne = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .patch(`/animals/${animalOne.id}`)
            .set('x-access-token', 'valid token')
            .send(animalOne)
            .expect(403);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.FORBIDDEN);
    });
});
