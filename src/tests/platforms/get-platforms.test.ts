import request from 'supertest';
import nock from 'nock';

import { app } from '../fixtures/setup';
import { generatePlatform } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { platformRepository } from '../../repositories/platform.repository';
import { ERRORS } from '../../translates';

describe('GET /platforms request', () => {
    afterEach(async () => {
        await platformRepository.deleteAll();
    });

    test('Should return platforms successfully', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        await platformRepository.create(generatePlatform());
        await platformRepository.create(generatePlatform());
        await platformRepository.create(generatePlatform());

        const response = await request(app)
            .get('/platforms')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: platforms } = response.body;

        const platformsInDb = await platformRepository.getAll();
        expect(platformsInDb?.length).toBe(3);
        expect(platforms?.length).toBe(3);
    });

    test('Should fail with auth error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        await platformRepository.create(generatePlatform());
        await platformRepository.create(generatePlatform());

        const response = await request(app)
            .post('/platforms')
            .set('x-access-token', 'invalid token')
            .expect(401);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.AUTH_REQUIRED);
    });
});
