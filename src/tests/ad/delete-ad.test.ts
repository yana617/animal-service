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

describe('DELETE /ads/:id request', () => {
    afterEach(async () => {
        await adRepository.deleteAll();
        await platformRepository.deleteAll();
        await animalRepository.deleteAll();

        nock.cleanAll();
    });

    it('should allow admin to delete any ad', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/users/me')
            .reply(200, {
                success: true,
                data: { id: v4(), role: 'ADMIN' },
            });

        const animal = await animalRepository.create(generateAnimal());
        const platform = await platformRepository.create(generatePlatform());
        const ad = await adRepository.create({
            user_id: v4(),
            animal,
            platform,
            date: new Date(),
        });

        const response = await request(app)
            .delete(`/ads/${ad.id}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        expect(response.body.success).toBe(true);

        const deletedAd = await adRepository.getById(ad.id);
        expect(deletedAd).toBeNull();
    });

    it('should allow owner to delete their own ad', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const userId = v4();
        nock(AUTH_BASE_URL)
            .get('/users/me')
            .reply(200, {
                success: true,
                data: { id: userId, role: 'USER' },
            });

        const animal = await animalRepository.create(generateAnimal());
        const platform = await platformRepository.create(generatePlatform());
        const ad = await adRepository.create({
            user_id: userId, // Same user as the requester
            animal,
            platform,
            date: new Date(),
        });

        const response = await request(app)
            .delete(`/ads/${ad.id}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        expect(response.body.success).toBe(true);

        const deletedAd = await adRepository.getById(ad.id);
        expect(deletedAd).toBeNull();
    });

    it('should fail with auth error when token is invalid', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        const animal = await animalRepository.create(generateAnimal());
        const platform = await platformRepository.create(generatePlatform());
        const ad = await adRepository.create({
            user_id: v4(),
            animal,
            platform,
            date: new Date(),
        });

        const response = await request(app)
            .delete(`/ads/${ad.id}`)
            .set('x-access-token', 'invalid token')
            .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.AUTH_REQUIRED);
    });

    it("should return 403 when user tries to delete someone else's ad and is not admin", async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const userId = v4();
        const otherUserId = v4();

        nock(AUTH_BASE_URL)
            .get('/users/me')
            .reply(200, {
                success: true,
                data: { id: userId, role: 'USER' },
            });

        const animal = await animalRepository.create(generateAnimal());
        const platform = await platformRepository.create(generatePlatform());
        const ad = await adRepository.create({
            user_id: otherUserId, // Different user
            animal,
            platform,
            date: new Date(),
        });

        const response = await request(app)
            .delete(`/ads/${ad.id}`)
            .set('x-access-token', 'valid token')
            .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.FORBIDDEN);

        const existingAd = await adRepository.getById(ad.id);
        expect(existingAd).not.toBeNull();
    });

    it('should return 404 when ad does not exist', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/users/me')
            .reply(200, {
                success: true,
                data: { id: v4(), role: 'ADMIN' },
            });

        const nonExistentAdId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app)
            .delete(`/ads/${nonExistentAdId}`)
            .set('x-access-token', 'valid token')
            .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.AD_NOT_FOUND);
    });

    it('should return 404 when ad id format is invalid (non-UUID)', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/auth')
            .reply(200, {
                success: true,
                data: { id: v4(), role: 'ADMIN' },
            });

        const invalidAdId = 'not-a-valid-uuid';

        const response = await request(app)
            .delete(`/ads/${invalidAdId}`)
            .set('x-access-token', 'valid token')
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
    });
});
