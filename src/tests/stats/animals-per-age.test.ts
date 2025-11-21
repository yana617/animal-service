import request from 'supertest';
import nock from 'nock';

import { app } from '../fixtures/setup';
import { generateAnimal } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { animalRepository } from '../../repositories/animal.repository';
import { ERRORS } from '../../translates';
import { Status } from '../../database/models/animal';

describe('GET /stats/animals-per-age request', () => {
    afterEach(async () => {
        await animalRepository.deleteAll();
    });

    test('Should return animals per age statistics successfully', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['VIEW_RATING'] });

        const today = new Date();

        // Less than 1 year
        const youngAnimal = generateAnimal({
            birthday: new Date(
                today.getFullYear(),
                today.getMonth() - 6,
                today.getDate(),
            ),
        });

        // 1 year
        const oneYearAnimal = generateAnimal({
            birthday: new Date(
                today.getFullYear() - 1,
                today.getMonth(),
                today.getDate(),
            ),
        });

        // 2 years
        const twoYearsAnimal = generateAnimal({
            birthday: new Date(
                today.getFullYear() - 2,
                today.getMonth(),
                today.getDate(),
            ),
        });

        await animalRepository.create(youngAnimal);
        await animalRepository.create(oneYearAnimal);
        await animalRepository.create(twoYearsAnimal);

        const response = await request(app)
            .get('/stats/animals-per-age')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: stats } = response.body;

        expect(stats).toBeInstanceOf(Array);
        expect(stats.length).toBe(3);

        const ageLabels = stats.map((stat) => stat.age);
        expect(ageLabels).toContain('меньше 1 года');
        expect(ageLabels).toContain('1 год');
        expect(ageLabels).toContain('2 года');

        const lessThanOneStat = stats.find(
            (stat) => stat.age === 'меньше 1 года',
        );
        const oneYearStat = stats.find((stat) => stat.age === '1 год');
        const twoYearsStat = stats.find((stat) => stat.age === '2 года');

        expect(lessThanOneStat?.count).toBe(1);
        expect(oneYearStat?.count).toBe(1);
        expect(twoYearsStat?.count).toBe(1);
    });

    test('Should return only homeless animals in statistics', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['VIEW_RATING'] });

        const homelessAnimal = generateAnimal();
        const adoptedAnimal = generateAnimal({ status: Status.ADOPTED });
        const lostAnimal = generateAnimal({ status: Status.LOST });

        await animalRepository.create(homelessAnimal);
        await animalRepository.create(adoptedAnimal);
        await animalRepository.create(lostAnimal);

        const response = await request(app)
            .get('/stats/animals-per-age')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: stats } = response.body;

        expect(
            stats.reduce((sum: number, stat: any) => sum + stat.count, 0),
        ).toBe(1);
    });

    test('Should return empty array when no homeless animals', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['VIEW_RATING'] });

        const adoptedAnimal = generateAnimal({ status: Status.ADOPTED });
        const lostAnimal = generateAnimal({ status: Status.LOST });

        await animalRepository.create(adoptedAnimal);
        await animalRepository.create(lostAnimal);

        const response = await request(app)
            .get('/stats/animals-per-age')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: stats } = response.body;

        expect(
            stats.reduce((sum: number, stat: any) => sum + stat.count, 0),
        ).toBe(0);
    });

    test('Should group animals by correct age ranges', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['VIEW_RATING'] });

        const today = new Date();

        const youngAnimal1 = generateAnimal({
            birthday: new Date(
                today.getFullYear(),
                today.getMonth() - 2,
                today.getDate(),
            ),
        });
        const youngAnimal2 = generateAnimal({
            birthday: new Date(
                today.getFullYear(),
                today.getMonth() - 8,
                today.getDate(),
            ),
        });

        const threeYearsAnimal = generateAnimal({
            birthday: new Date(
                today.getFullYear() - 3,
                today.getMonth(),
                today.getDate(),
            ),
        });

        const sevenYearsAnimal = generateAnimal({
            birthday: new Date(
                today.getFullYear() - 7,
                today.getMonth(),
                today.getDate(),
            ),
        });

        await animalRepository.create(youngAnimal1);
        await animalRepository.create(youngAnimal2);
        await animalRepository.create(threeYearsAnimal);
        await animalRepository.create(sevenYearsAnimal);

        const response = await request(app)
            .get('/stats/animals-per-age')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: stats } = response.body;

        expect(stats.length).toBe(8);

        const lessThanOneStat = stats.find(
            (stat) => stat.age === 'меньше 1 года',
        );
        const twoYearsStat = stats.find((stat) => stat.age === '2 года');
        const threeYearsStat = stats.find((stat) => stat.age === '3 года');

        expect(twoYearsStat?.count).toBe(0);
        expect(lessThanOneStat?.count).toBe(2);
        expect(threeYearsStat?.count).toBe(1);
    });

    test('Should fail with auth error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        const response = await request(app)
            .get('/stats/animals-per-age')
            .set('x-access-token', 'invalid token')
            .expect(401);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.AUTH_REQUIRED);
    });
});
