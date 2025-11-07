import request from 'supertest';

import { animalRepository } from '../../repositories/animal.repository';
import { generateAnimal, generateAnimalImage } from '../fixtures/db';
import { Status } from '../../database/models/animal';
import { app } from '../fixtures/setup';
import { animalImageRepository } from '../../repositories/animal-image.repository';

const animal1Mock = generateAnimal();
const image1Mock = generateAnimalImage(animal1Mock);

describe('GET /animals/short', () => {
    afterEach(async () => {
        await animalImageRepository.deleteAll();
        await animalRepository.deleteAll();
    });

    test('Should return animals', async () => {
        await animalRepository.create(animal1Mock);
        await animalImageRepository.create(image1Mock);
        await animalRepository.create(generateAnimal());
        await animalRepository.create(
            generateAnimal({ status: Status.PREPARATION }),
        );
        await animalRepository.create(
            generateAnimal({ status: Status.ADOPTED }),
        );

        const response = await request(app)
            .get('/animals/short')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: res } = response.body;
        expect(res.animals).toBeDefined();
        expect(res.animals.length).toEqual(3);

        expect(res.animals.find((a) => a.name === animal1Mock.name).photo).toBeDefined();
    });
});
