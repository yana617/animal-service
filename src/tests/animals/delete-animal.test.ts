import request from 'supertest';
import nock from 'nock';
import { v4 } from 'uuid';

import { animalRepository } from '../../repositories/animal.repository';
import { app } from '../fixtures/setup';
import { generateAnimal, generateAnimalImage } from '../fixtures/db';
import { ERRORS } from '../../translates';
import { BASE_URL } from '../fixtures/constants';
import { animalImageRepository } from '../../repositories/animal-image.repository';

describe('DELETE /animals/:id request', () => {
    beforeEach(async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
    });

    afterEach(async () => {
        await animalImageRepository.deleteAll();
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

    test('Should delete animal correctly', async () => {
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['DELETE_ANIMAL'] });
        const animalOne = await animalRepository.create(generateAnimal());

        await request(app)
            .delete(`/animals/${animalOne.id}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        const animalInDb = await animalRepository.findOne({
            where: { id: animalOne.id },
        });
        expect(animalInDb).toBeNull();
    });

    test('Should delete images correctly', async () => {
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['DELETE_ANIMAL'] });
        const animalOne = await animalRepository.create(generateAnimal());
        const imageOne = await animalImageRepository.create(
            generateAnimalImage(animalOne),
        );

        await request(app)
            .delete(`/animals/${animalOne.id}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        const animalInDb = await animalRepository.findOne({
            where: { id: animalOne.id },
        });
        expect(animalInDb).toBeNull();

        const imageInDb = await animalImageRepository.findOne({
            where: { id: imageOne.id },
        });
        expect(imageInDb).toBeNull();
    });

    test('Should fail with not found error', async () => {
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['DELETE_ANIMAL'] });

        const response = await request(app)
            .delete(`/animals/${v4()}`)
            .set('x-access-token', 'valid token')
            .expect(404);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.ANIMAL_NOT_FOUND);
    });

    test('Should fail without permissions', async () => {
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: [] });
        const animalOne = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .delete(`/animals/${animalOne.id}`)
            .set('x-access-token', 'valid token')
            .expect(403);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.FORBIDDEN);
    });
});
