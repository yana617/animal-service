import request from 'supertest';
import nock from 'nock';

import { animalRepository } from '../../repositories/animal.repository';
import { app } from '../fixtures/setup';
import { generateAnimal } from '../fixtures/db';
import { ERRORS } from '../../translates';

describe('GET /animals/:id request', () => {
    beforeEach(async () => {
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

    test('Should return correct animal', async () => {
        const animalOne = generateAnimal();
        await animalRepository.create(animalOne);

        const response = await request(app)
            .get(`/animals/${animalOne.id}`)
            .expect(200);

        const { data: animal } = response.body;
        expect(animal).toHaveProperty('name', animalOne.name);
        expect(animal).toHaveProperty('sex', animalOne.sex);
    });

    test('Should fail with not found error', async () => {
        const animalOne = generateAnimal();
        const response = await request(app)
            .get(`/animals/${animalOne.id}`)
            .expect(404);

        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.ANIMAL_NOT_FOUND);
    });

    test('Should fail if id is invalid format', async () => {
        const response = await request(app)
            .get('/animals/invalid-id')
            .expect(400);

        const { errors } = response.body;
        expect(errors).toBeDefined();
    });
});
