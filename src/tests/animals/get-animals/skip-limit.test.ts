import request from 'supertest';
import nock from 'nock';

import { generateAnimal } from '../../fixtures/db';
import { animalRepository } from '../../../repositories/animal.repository';
import { AUTH_SERVICE_URL } from '../../../constant/auth-service-url';
import { app } from '../../fixtures/setup';

describe('GET /animals', () => {
    beforeEach(async () => {
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

    test('Should return searched animals', async () => {
        nock(AUTH_SERVICE_URL).get('/auth').reply(200, { success: true });

        await animalRepository.create(generateAnimal());
        await animalRepository.create(generateAnimal());
        await animalRepository.create(generateAnimal());
        await animalRepository.create(generateAnimal());
        await animalRepository.create(generateAnimal());

        const response = await request(app)
            .get('/animals?skip=0&limit=2')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: res } = response.body;
        expect(res.animals.length).toEqual(2);
        expect(res.total).toEqual(5);

        // -----

        const response2 = await request(app)
            .get('/animals?skip=4&limit=2')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: res2 } = response2.body;
        expect(res2.animals.length).toEqual(1);
        expect(res2.total).toEqual(5);
    });

    test('Should not apply skip without limit', async () => {
        nock(AUTH_SERVICE_URL).get('/auth').reply(200, { success: true });

        await animalRepository.create(generateAnimal());
        await animalRepository.create(generateAnimal());
        await animalRepository.create(generateAnimal());
        await animalRepository.create(generateAnimal());
        await animalRepository.create(generateAnimal());

        const response = await request(app)
            .get('/animals?skip=3')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: res } = response.body;
        expect(res.animals.length).toEqual(5);
        expect(res.total).toEqual(5);
    });
});
