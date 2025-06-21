import request from 'supertest';
import nock from 'nock';

import { animalRepository } from '../../../repositories/animal.repository';
import { app } from '../../fixtures/setup';
import { generateAnimal } from '../../fixtures/db';
import { AUTH_BASE_URL } from '../../fixtures/constants';
import { AnimalType } from '../../../database/models/animal';

describe('POST /animals request - succeed', () => {
    afterEach(async () => {
        await animalRepository.deleteAll();
    });

    test('Should create animal successfully', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['CREATE_ANIMAL'] });

        const animalOne = generateAnimal({ type: AnimalType.DOG });

        const response = await request(app)
            .post('/animals')
            .set('x-access-token', 'valid token')
            .send(animalOne)
            .expect(200);

        const { data: animal } = response.body;

        const animalInDb = await animalRepository.findOne({
            where: { name: animalOne.name },
        });
        expect(animalInDb?.name).toBe(animal.name);
        expect(animalInDb?.name).toBe(animalOne.name);
    });
});
