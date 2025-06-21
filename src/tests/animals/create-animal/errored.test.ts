import request from 'supertest';
import nock from 'nock';

import { animalRepository } from '../../../repositories/animal.repository';
import { app } from '../../fixtures/setup';
import { generateAnimal } from '../../fixtures/db';
import { AUTH_BASE_URL } from '../../fixtures/constants';
import { ERRORS } from '../../../translates';

describe('POST /animals request - errored', () => {
    beforeEach(async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['CREATE_ANIMAL'] });
    });

    afterEach(async () => {
        nock.cleanAll();
        await animalRepository.deleteAll();
    });

    test('Should fail with validation error (sex enum)', async () => {
        const animalOne = generateAnimal();

        const response = await request(app)
            .post('/animals')
            .set('x-access-token', 'valid token')
            .send({ ...animalOne, sex: 'random' })
            .expect(400);

        const { errors } = response.body;
        expect(errors).toBeDefined();
    });

    test('Should fail with validation error (birthday date)', async () => {
        const animalOne = generateAnimal();

        const response = await request(app)
            .post('/animals')
            .set('x-access-token', 'valid token')
            .send({ ...animalOne, birthday: 'hello' })
            .expect(400);

        const { errors } = response.body;
        expect(errors).toBeDefined();
    });

    test('Should fail with validation error (height number)', async () => {
        const animalOne = generateAnimal();

        const response = await request(app)
            .post('/animals')
            .set('x-access-token', 'valid token')
            .send({ ...animalOne, height: 'hello' })
            .expect(400);

        const { errors } = response.body;
        expect(errors).toBeDefined();
    });

    test('Should fail with validation error (room number)', async () => {
        const animalOne = generateAnimal();

        const response = await request(app)
            .post('/animals')
            .set('x-access-token', 'valid token')
            .send({ ...animalOne, room: 20 })
            .expect(400);

        const { errors } = response.body;
        expect(errors).toBeDefined();
    });

    test('Should fail with auth error', async () => {
        nock.cleanAll();
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });
        const animalOne = generateAnimal();

        const response = await request(app)
            .post('/animals')
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
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: [] });
        const animalOne = generateAnimal();

        const response = await request(app)
            .post('/animals')
            .set('x-access-token', 'valid token')
            .send(animalOne)
            .expect(403);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.FORBIDDEN);
    });
});
