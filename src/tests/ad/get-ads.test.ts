import request from 'supertest';
import nock from 'nock';

import { app } from '../fixtures/setup';
import { generateAd, generateAnimal, generatePlatform } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { platformRepository } from '../../repositories/platform.repository';
import { ERRORS } from '../../translates';
import { adRepository } from '../../repositories/ad.repository';
import { animalRepository } from '../../repositories/animal.repository';
import { type Animal, Status } from '../../database/models/animal';
import { type Platform } from '../../database/models/platform';

const todayDate = new Date();

const oneMonthAgoDate = new Date();
oneMonthAgoDate.setMonth(todayDate.getMonth() - 1);

describe('GET /ads request', () => {
    afterEach(async () => {
        await adRepository.deleteAll();
        await platformRepository.deleteAll();
        await animalRepository.deleteAll();

        nock.cleanAll();
    });

    const createAds = async (): Promise<{
        platformOne: Platform;
        platformTwo: Platform;
        animalHomelessOne: Animal;
        animalHomelessTwo: Animal;
    }> => {
        const platformOne = await platformRepository.create(generatePlatform());
        const platformTwo = await platformRepository.create(generatePlatform());

        const animalHomelessOne = await animalRepository.create(
            generateAnimal(),
        );
        const animalHomelessTwo = await animalRepository.create(
            generateAnimal(),
        );
        const animalAdopted = await animalRepository.create(
            generateAnimal({ status: Status.ADOPTED }),
        );

        await adRepository.create(generateAd(animalHomelessOne, platformOne));
        await adRepository.create(generateAd(animalHomelessOne, platformOne));
        await adRepository.create(
            generateAd(animalHomelessOne, platformTwo, { date: todayDate }),
        );

        await adRepository.create(generateAd(animalAdopted, platformOne));
        await adRepository.create(generateAd(animalAdopted, platformOne));

        await adRepository.create(
            generateAd(animalHomelessTwo, platformTwo, {
                date: oneMonthAgoDate,
            }),
        );

        return { platformOne, platformTwo, animalHomelessOne, animalHomelessTwo };
    };

    test('Should return ads successfully', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        await createAds();

        const response = await request(app)
            .get('/ads')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals } = response.body;

        expect(animals?.length).toBe(2);
    });

    test('Should return ads sorted ASC / DESC', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const { platformTwo, animalHomelessOne, animalHomelessTwo } =
            await createAds();

        const responseAsc = await request(app)
            .get(`/ads?sortByPlatform=${platformTwo.id}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals } = responseAsc.body;

        expect(animals?.length).toBe(2);
        expect(animals[0].animal_id).toBe(animalHomelessTwo.id);
        expect(animals[1].animal_id).toBe(animalHomelessOne.id);

        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const responseDesc = await request(app)
            .get(`/ads?sortByPlatform=${platformTwo.id}&sortOrder=DESC`)
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animalsDesc } = responseDesc.body;

        expect(animalsDesc?.length).toBe(2);
        expect(animalsDesc[0].animal_id).toBe(animalHomelessOne.id);
        expect(animalsDesc[1].animal_id).toBe(animalHomelessTwo.id);
    });

    test('Should return sorted correctly when no ads', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const { platformOne, animalHomelessOne, animalHomelessTwo } =
            await createAds();

        const responseAsc = await request(app)
            .get(`/ads?sortByPlatform=${platformOne.id}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals } = responseAsc.body;

        expect(animals?.length).toBe(2);
        expect(animals[0].animal_id).toBe(animalHomelessTwo.id);
        expect(animals[1].animal_id).toBe(animalHomelessOne.id);

        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const responseDesc = await request(app)
            .get(`/ads?sortByPlatform=${platformOne.id}&sortOrder=DESC`)
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animalsDesc } = responseDesc.body;

        expect(animalsDesc?.length).toBe(2);
        expect(animalsDesc[0].animal_id).toBe(animalHomelessOne.id);
        expect(animalsDesc[1].animal_id).toBe(animalHomelessTwo.id);
    });

    test('Should fail with auth error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        const response = await request(app)
            .get('/ads')
            .set('x-access-token', 'invalid token')
            .expect(401);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.AUTH_REQUIRED);
    });
});
