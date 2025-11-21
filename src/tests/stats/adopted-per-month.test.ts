import request from 'supertest';
import nock from 'nock';

import { app } from '../fixtures/setup';
import { generateAnimal } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { animalRepository } from '../../repositories/animal.repository';
import { ERRORS } from '../../translates';
import { Status } from '../../database/models/animal';
import { monthNames } from '../../utils/stats/format-monthly-results-last-12-months';

describe('GET /stats/adopted-per-month request', () => {
    afterEach(async () => {
        await animalRepository.deleteAll();
    });

    test('Should return adopted animals per month statistics for last 12 months', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['VIEW_RATING'] });

        const todayMaybeFirst = new Date();
        const today = new Date(
            todayMaybeFirst.getFullYear(),
            todayMaybeFirst.getMonth(),
            28,
        );

        const currentMonthAnimal = generateAnimal({
            status: Status.ADOPTED,
            taken_home_date: new Date(
                today.getFullYear(),
                today.getMonth(),
                15,
            ),
        });

        const lastMonthAnimal1 = generateAnimal({
            status: Status.ADOPTED,
            taken_home_date: new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                10,
            ),
        });

        const lastMonthAnimal2 = generateAnimal({
            status: Status.ADOPTED,
            taken_home_date: new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                20,
            ),
        });

        const threeMonthsAgoAnimal = generateAnimal({
            status: Status.ADOPTED,
            taken_home_date: new Date(
                today.getFullYear(),
                today.getMonth() - 3,
                5,
            ),
        });

        const twoYearsAgoAnimal = generateAnimal({
            status: Status.ADOPTED,
            taken_home_date: new Date(
                today.getFullYear() - 2,
                today.getMonth(),
                15,
            ),
        });

        const homelessAnimal = generateAnimal({
            taken_home_date: new Date(
                today.getFullYear(),
                today.getMonth() - 3,
                5,
            ),
        });

        const adoptedWithoutTakenHomeDateAnimal = generateAnimal({
            status: Status.ADOPTED,
        });

        await animalRepository.create(currentMonthAnimal);
        await animalRepository.create(lastMonthAnimal1);
        await animalRepository.create(lastMonthAnimal2);
        await animalRepository.create(threeMonthsAgoAnimal);
        await animalRepository.create(homelessAnimal);
        await animalRepository.create(adoptedWithoutTakenHomeDateAnimal);
        await animalRepository.create(twoYearsAgoAnimal);

        const response = await request(app)
            .get('/stats/adopted-per-month')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: stats } = response.body;

        expect(stats.length).toBe(12);

        const currentMonthCount = stats.find(
            (stat) =>
                stat.month.includes(getMonthName(today.getMonth())) &&
                stat.month.includes(today.getFullYear().toString()),
        )?.count;

        const lastMonthCount = stats.find(
            (stat) =>
                stat.month.includes(getMonthName(today.getMonth() - 1)) &&
                stat.month.includes(getYearForMonth(today, -1).toString()),
        )?.count;

        const threeMonthsAgoCount = stats.find(
            (stat) =>
                stat.month.includes(getMonthName(today.getMonth() - 3)) &&
                stat.month.includes(getYearForMonth(today, -3).toString()),
        )?.count;

        expect(currentMonthCount).toBe(1);
        expect(lastMonthCount).toBe(2);
        expect(threeMonthsAgoCount).toBe(1);

        stats.forEach((monthStat) => {
            expect(monthStat).toHaveProperty('month');
            expect(monthStat).toHaveProperty('count');
            expect(typeof monthStat.month).toBe('string');
            expect(typeof monthStat.count).toBe('number');
            expect(monthStat.count).toBeGreaterThanOrEqual(0);
        });
    });

    test('Should return zeros for months with no adoptions', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['VIEW_RATING'] });

        const homelessAnimal1 = generateAnimal({ status: Status.HOMELESS });
        const homelessAnimal2 = generateAnimal({ status: Status.HOMELESS });

        await animalRepository.create(homelessAnimal1);
        await animalRepository.create(homelessAnimal2);

        const response = await request(app)
            .get('/stats/adopted-per-month')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: stats } = response.body;

        expect(stats).toBeInstanceOf(Array);
        expect(stats.length).toBe(12);

        stats.forEach((monthStat) => {
            expect(monthStat.count).toBe(0);
        });
    });

    test('Should fail with auth error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        const response = await request(app)
            .get('/stats/adopted-per-month')
            .set('x-access-token', 'invalid token')
            .expect(401);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.AUTH_REQUIRED);
    });

    test('Should fail without VIEW_RATING permission', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: [] });

        const response = await request(app)
            .get('/stats/adopted-per-month')
            .set('x-access-token', 'valid token')
            .expect(403);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.FORBIDDEN);
    });
});

function getMonthName(monthIndex: number): string {
    return monthNames[(monthIndex + 12) % 12];
}

function getYearForMonth(currentDate: Date, monthsOffset: number): number {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + monthsOffset);
    return date.getFullYear();
}
