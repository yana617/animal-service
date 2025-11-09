import request from 'supertest';
import nock from 'nock';
import { v4 } from 'uuid';

import { app } from '../fixtures/setup';
import { generatePlatform } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { platformRepository } from '../../repositories/platform.repository';
import { ERRORS } from '../../translates';

describe('GET /platform/:id request', () => {
    afterEach(async () => {
        nock.cleanAll();
        await platformRepository.deleteAll();
    });

    test('Should return platform successfully', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const platformOne = await platformRepository.create(generatePlatform());

        const response = await request(app)
            .get(`/platforms/${platformOne.id}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: platform } = response.body;
        expect(platformOne.name).toBe(platform.name);
    });

    test('Should fail with not found error', async () => {
         nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const response = await request(app)
            .get(`/platforms/${v4()}`)
            .set('x-access-token', 'valid token')
            .expect(404);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.PLATFORM_NOT_FOUND);
    });

    test('Should fail with auth error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        const platformOne = await platformRepository.create(generatePlatform());

        const response = await request(app)
            .get(`/platforms/${platformOne.id}`)
            .set('x-access-token', 'invalid token')
            .expect(401);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.AUTH_REQUIRED);
    });
});
