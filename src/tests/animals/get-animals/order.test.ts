import request from 'supertest';
import nock from 'nock';

import { generateAnimal } from '../../fixtures/db';
import { animalRepository } from '../../../repositories/animal.repository';
import { AUTH_SERVICE_URL } from '../../../constant/auth-service-url';
import { app } from '../../fixtures/setup';

beforeEach(async () => {
    await animalRepository.deleteAll();
    nock.cleanAll();
});

describe('GET /animals', () => {
    test('Should return sorted animals', async () => {
        nock(AUTH_SERVICE_URL).get('/auth').reply(200, { success: true });

        const animal1 = generateAnimal({
            birthday: new Date('2020-01-01'),
            name: 'Ari',
        });
        const animal2 = generateAnimal({
            birthday: new Date('2022-01-01'),
            name: 'Wanda',
        });
        const animal3 = generateAnimal({
            birthday: new Date('2024-01-01'),
            name: 'Ozzy',
        });

        await animalRepository.create(animal1);
        await animalRepository.create(animal2);
        await animalRepository.create(animal3);

        const byNameAscOrderResponse = await request(app)
            .get('/animals?order=ASC&sortBy=name')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals } = byNameAscOrderResponse.body;
        expect(animals.length).toEqual(3);
        expect(animals.map((animal) => animal.name)).toEqual([
            animal1.name,
            animal3.name,
            animal2.name,
        ]);

        const byNameDescOrderResponse = await request(app)
            .get('/animals?order=DESC&sortBy=name')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals2 } = byNameDescOrderResponse.body;
        expect(animals2.map((animal) => animal.name)).toEqual([
            animal2.name,
            animal3.name,
            animal1.name,
        ]);

        const byBirthdayAscOrderResponse = await request(app)
            .get('/animals?sortBy=birthday')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals3 } = byBirthdayAscOrderResponse.body;
        expect(animals3.map((animal) => animal.name)).toEqual([
            animal1.name,
            animal2.name,
            animal3.name,
        ]);

        const byBirthdayDescOrderResponse = await request(app)
            .get('/animals?order=DESC&sortBy=birthday')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals4 } = byBirthdayDescOrderResponse.body;
        expect(animals4.map((animal) => animal.name)).toEqual([
            animal3.name,
            animal2.name,
            animal1.name,
        ]);
    });
});
