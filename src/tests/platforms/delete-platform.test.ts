import request from 'supertest';
import nock from 'nock';
import { v4 } from 'uuid';

import { app } from '../fixtures/setup';
import { generatePlatform } from '../fixtures/db';
import { ERRORS } from '../../translates';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { platformRepository } from '../../repositories/platform.repository';

describe('DELETE /platforms/:id request', () => {
    beforeEach(async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
    });

    afterEach(async () => {
        await platformRepository.deleteAll();
        nock.cleanAll();
    });

    test('Should delete platform correctly', async () => {
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['MANAGE_PLATFORMS'] });
        const platformOne = await platformRepository.create(generatePlatform());

        await request(app)
            .delete(`/platforms/${platformOne.id}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        const platformInDb = await platformRepository.findOne({
            where: { id: platformOne.id },
        });
        expect(platformInDb).toBeNull();
    });

    test('Should fail with not found error', async () => {
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['MANAGE_PLATFORMS'] });

        const response = await request(app)
            .delete(`/platforms/${v4()}`)
            .set('x-access-token', 'valid token')
            .expect(404);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.PLATFORM_NOT_FOUND);
    });

    test('Should fail without permissions', async () => {
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: [] });
        const platformOne = await platformRepository.create(generatePlatform());

        const response = await request(app)
            .delete(`/platforms/${platformOne.id}`)
            .set('x-access-token', 'valid token')
            .expect(403);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.FORBIDDEN);
    });
});
