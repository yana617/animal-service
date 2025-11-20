import request from 'supertest';
import nock from 'nock';

import { app } from '../fixtures/setup';
import { generatePlatform } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { platformRepository } from '../../repositories/platform.repository';
import { ERRORS } from '../../translates';

describe('POST /platforms request', () => {
    beforeEach(() => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['MANAGE_PLATFORMS'] });
    });

    afterEach(async () => {
        await platformRepository.deleteAll();
    });

    test('Should create platform successfully', async () => {
        const platformOne = generatePlatform();

        const response = await request(app)
            .post('/platforms')
            .set('x-access-token', 'valid token')
            .send(platformOne)
            .expect(200);

        const { data: platform } = response.body;

        const platformInDb = await platformRepository.findOne({
            where: { name: platformOne.name },
        });
        expect(platformInDb?.name).toBe(platformOne.name);
        expect(platformInDb?.name).toBe(platform.name);
    });

    test('Should fail with validation error (name length)', async () => {
        const response = await request(app)
            .post('/platforms')
            .set('x-access-token', 'valid token')
            .send({ name: 'one two three looooooong name looooooooooooong' })
            .expect(400);

        const { errors } = response.body;
        expect(errors).toBeDefined();
    });

    test('Should fail with auth error', async () => {
        nock.cleanAll();
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });
        const platformOne = generatePlatform();

        const response = await request(app)
            .post('/platforms')
            .set('x-access-token', 'invalid token')
            .send(platformOne)
            .expect(401);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.AUTH_REQUIRED);
    });
});
