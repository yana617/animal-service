import request from 'supertest';
import nock from 'nock';

import { animalRepository } from '../../../repositories/animal.repository';
import { app } from '../../fixtures/setup';
import { generateAnimal } from '../../fixtures/db';
import { BASE_URL } from '../../fixtures/constants';
import { AnimalType } from '../../../database/models/animal';

describe('PATCH /animals request', () => {
    afterEach(async () => {
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

    test('Should update animal successfully', async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });

        const animalOne = await animalRepository.create(
            generateAnimal({ type: AnimalType.DOG }),
        );
        const updatedAnimal = generateAnimal({ type: AnimalType.DOG });

        await request(app)
            .patch(`/animals/${animalOne.id}`)
            .set('x-access-token', 'valid token')
            .send({
                ...animalOne,
                name: updatedAnimal.name,
                advertising_text: updatedAnimal.advertising_text,
            })
            .expect(200);

        const animalInDb = await animalRepository.findOne({
            where: { id: animalOne.id },
        });
        expect(animalInDb?.name).toBe(updatedAnimal.name);
        expect(animalInDb?.advertising_text).toBe(
            updatedAnimal.advertising_text,
        );
    });
});
