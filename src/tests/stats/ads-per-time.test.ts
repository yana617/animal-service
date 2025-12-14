import request from 'supertest';
import nock from 'nock';

import { app } from '../fixtures/setup';
import { generateAd, generateAnimal, generatePlatform } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { adRepository } from '../../repositories/ad.repository';
import { animalRepository } from '../../repositories/animal.repository';
import { platformRepository } from '../../repositories/platform.repository';
import { ERRORS } from '../../translates';

describe('GET /stats/ads-per-time request', () => {
    beforeEach(async () => {
        await adRepository.deleteAll();
        await animalRepository.deleteAll();
        await platformRepository.deleteAll();
    });

    afterEach(async () => {
        await adRepository.deleteAll();
        await animalRepository.deleteAll();
        await platformRepository.deleteAll();
        nock.cleanAll();
    });

    const createTestAds = async (dates: Date[]): Promise<void> => {
        const platform = await platformRepository.create(generatePlatform());
        const animal = await animalRepository.create(generateAnimal());

        for (const date of dates) {
            await adRepository.create(generateAd(animal, platform, { date }));
        }
    };

    test('Should return weekly ads statistics successfully', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['VIEW_RATING'] });

        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(today.getDate() - 14);

        await createTestAds([today, today, oneWeekAgo, twoWeeksAgo]);

        const response = await request(app)
            .get('/stats/ads-per-time')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data } = response.body;

        expect(response.body.success).toBe(true);
        expect(data).toHaveProperty('stats');
        expect(data).toHaveProperty('total');
        expect(data.total).toBe(4);
        expect(data.stats).toHaveLength(12);

        const statsWithAds = data.stats.filter((stat: any) => stat.count > 0);
        expect(statsWithAds.length).toBeGreaterThan(0);
    });

    test('Should return monthly ads statistics successfully', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['VIEW_RATING'] });

        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);

        const twoMonthsAgo = new Date(today);
        twoMonthsAgo.setMonth(today.getMonth() - 2);

        await createTestAds([today, today, oneMonthAgo, twoMonthsAgo]);

        const response = await request(app)
            .get('/stats/ads-per-time?type=month')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data } = response.body;

        expect(response.body.success).toBe(true);
        expect(data.total).toBe(4);
        expect(data.stats).toHaveLength(12);
    });

    test('Should only include ads within the date range for weekly stats', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['VIEW_RATING'] });

        const today = new Date();

        const withinRangeDate = new Date(today);
        withinRangeDate.setDate(today.getDate() - 30);

        const outsideRangeDate = new Date(today);
        outsideRangeDate.setFullYear(today.getFullYear() - 2);

        await createTestAds([today, withinRangeDate, outsideRangeDate]);

        const response = await request(app)
            .get('/stats/ads-per-time?type=week')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data } = response.body;

        expect(data.total).toBe(2);
    });

    test('Should fail with auth error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        const response = await request(app)
            .get('/stats/ads-per-time')
            .set('x-access-token', 'invalid token')
            .expect(401);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.AUTH_REQUIRED);
    });

    test('Should fail with permission error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['OTHER_PERMISSION'] });

        const response = await request(app)
            .get('/stats/ads-per-time')
            .set('x-access-token', 'valid token')
            .expect(403);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.FORBIDDEN);
    });

    test('Should handle empty ads data correctly', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['VIEW_RATING'] });

        const response = await request(app)
            .get('/stats/ads-per-time?type=week')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data } = response.body;

        expect(response.body.success).toBe(true);
        expect(data.total).toBe(0);
        expect(data.stats).toHaveLength(12);

        data.stats.forEach((stat: any) => {
            expect(stat.count).toBe(0);
        });
    });
});
