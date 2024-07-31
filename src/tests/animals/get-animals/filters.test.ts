import request from 'supertest';
import nock from 'nock';

import { generateAnimal } from '../../fixtures/db';
import { animalRepository } from '../../../repositories/animal.repository';
import { AUTH_SERVICE_URL } from '../../../constant/auth-service-url';
import { app } from '../../fixtures/setup';
import {
    AnimalType,
    Place,
    Sex,
    Status,
} from '../../../database/models/animal';

beforeEach(async () => {
    await animalRepository.deleteAll();
    nock.cleanAll();
});

describe('GET /animals', () => {
    test('Should return animals', async () => {
        await animalRepository.create(generateAnimal());
        await animalRepository.create(generateAnimal());
        await animalRepository.create(generateAnimal());
        await animalRepository.create(
            generateAnimal({ status: Status.PREPARATION }),
        );

        const response = await request(app)
            .get('/animals')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals } = response.body;
        expect(animals).toBeDefined();
        expect(animals.length).toEqual(3);

        const responseForMultiStatus = await request(app)
            .get(`/animals?status=${Status.HOMELESS},${Status.PREPARATION}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals2 } = responseForMultiStatus.body;
        expect(animals2.length).toEqual(4);
    });

    test('Should return animals with filters correctly (type, sex)', async () => {
        nock(AUTH_SERVICE_URL).get('/auth').reply(200, { success: true });

        await animalRepository.create(
            generateAnimal({ type: AnimalType.DOG, sex: Sex.MALE }),
        );
        await animalRepository.create(
            generateAnimal({ type: AnimalType.DOG, sex: Sex.FEMALE }),
        );
        await animalRepository.create(
            generateAnimal({ type: AnimalType.CAT, sex: Sex.MALE }),
        );

        const {
            body: { data: animals1 },
        } = await request(app)
            .get(`/animals?type=${AnimalType.DOG}`)
            .set('x-access-token', 'valid token')
            .expect(200);
        expect(animals1.length).toEqual(2);

        const {
            body: { data: animals2 },
        } = await request(app)
            .get(`/animals?type=${AnimalType.DOG}&sex=${Sex.FEMALE}`)
            .set('x-access-token', 'valid token')
            .expect(200);
        expect(animals2.length).toEqual(1);

        const {
            body: { data: animals3 },
        } = await request(app)
            .get(`/animals?sex=${Sex.MALE}`)
            .set('x-access-token', 'valid token')
            .expect(200);
        expect(animals3.length).toEqual(2);
    });

    test('Should return animals with filters correctly (place, status)', async () => {
        nock(AUTH_SERVICE_URL).get('/auth').reply(200, { success: true });

        await animalRepository.create(
            generateAnimal({ place: Place.AVIARY, status: Status.PREPARATION }),
        );
        await animalRepository.create(
            generateAnimal({ place: Place.MAIN_HOUSE, status: Status.HOMELESS }),
        );
        await animalRepository.create(
            generateAnimal({
                place: Place.ON_TEMPORARY_HOLD,
                status: Status.PREPARATION,
            }),
        );

        const {
            body: { data: animals1 },
        } = await request(app)
            .get(`/animals?place=${Place.AVIARY}`)
            .set('x-access-token', 'valid token')
            .expect(200);
        expect(animals1.length).toEqual(0);

        const {
            body: { data: animals2 },
        } = await request(app)
            .get(`/animals?place=${Place.AVIARY}&status=${Status.PREPARATION}`)
            .set('x-access-token', 'valid token')
            .expect(200);
        expect(animals2.length).toEqual(1);

        const {
            body: { data: animals3 },
        } = await request(app)
            .get(`/animals?place=${Place.MAIN_HOUSE}`)
            .set('x-access-token', 'valid token')
            .expect(200);
        expect(animals3.length).toEqual(1);
    });

    test('Should return animals with filters correctly (birthday)', async () => {
        nock(AUTH_SERVICE_URL).get('/auth').reply(200, { success: true });

        await animalRepository.create(
            generateAnimal({ birthday: new Date('2024-01-01') }),
        );
        await animalRepository.create(
            generateAnimal({ birthday: new Date('2022-01-01') }),
        );
        await animalRepository.create(
            generateAnimal({ birthday: new Date('2020-01-01') }),
        );

        const responseWithBirthdayFrom = await request(app)
            .get('/animals?birthday_from=2021-01-01')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals } = responseWithBirthdayFrom.body;
        expect(animals).toBeDefined();
        expect(animals.length).toEqual(2);

        const responseWithBirthdayTo = await request(app)
            .get('/animals?birthday_to=2024-06-01')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals2 } = responseWithBirthdayTo.body;
        expect(animals2).toBeDefined();
        expect(animals2.length).toEqual(3);
    });

    test('Should return animals with filters correctly (height)', async () => {
        nock(AUTH_SERVICE_URL).get('/auth').reply(200, { success: true });

        await animalRepository.create(
            generateAnimal({ type: AnimalType.DOG, height: 20 }),
        );
        await animalRepository.create(
            generateAnimal({ type: AnimalType.DOG, height: 40 }),
        );
        await animalRepository.create(
            generateAnimal({ type: AnimalType.DOG, height: 60 }),
        );

        const response1 = await request(app)
            .get('/animals')
            .set('x-access-token', 'valid token')
            .expect(200);
        const { data: animals } = response1.body;
        expect(animals.length).toEqual(3);

        const response2 = await request(app)
            .get('/animals?type=dog&height_from=50')
            .set('x-access-token', 'valid token')
            .expect(200);
        const { data: animals2 } = response2.body;
        expect(animals2.length).toEqual(1);

        const response3 = await request(app)
            .get('/animals?type=dog&height_from=20&height_to=50')
            .set('x-access-token', 'valid token')
            .expect(200);
        const { data: animals3 } = response3.body;
        expect(animals3.length).toEqual(2);
    });
});
