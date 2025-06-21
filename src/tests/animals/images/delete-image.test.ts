import request from 'supertest';
import nock from 'nock';
import { v4 } from 'uuid';

import { generateAnimal, generateAnimalImage } from '../../fixtures/db';
import { animalImageRepository } from '../../../repositories/animal-image.repository';
import { animalRepository } from '../../../repositories/animal.repository';
import { app } from '../../fixtures/setup';
import { ERRORS } from '../../../translates';
import { BASE_URL } from '../../fixtures/constants';

const mockEnv = {
    AWS_REGION: 'us-east-1',
    AWS_ACCESS_KEY_ID: 'test-access-key',
    AWS_SECRET_ACCESS_KEY: 'test-secret-key',
    AWS_BUCKET_NAME: 'test-bucket',
};

describe('DELETE /animals/:id/images - deleteImage', () => {
    beforeEach(() => {
        process.env = { ...mockEnv };
    });

    afterEach(async () => {
        await animalImageRepository.deleteAll();
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

    it('should delete successfully', async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });

        const animal1 = await animalRepository.create(generateAnimal());
        const image1 = await animalImageRepository.create(
            generateAnimalImage(animal1),
        );

        const imageInDb = await animalImageRepository.findOne({
            where: { animal: animal1 },
        });
        expect(imageInDb).toBeDefined();

        const response = await request(app)
            .delete(`/animals/${animal1.id}/images/${image1.id}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        expect(response.body.success).toBe(true);

        const imageInDbAfterRequest = await animalImageRepository.findOne({
            where: { animal: animal1 },
        });
        expect(imageInDbAfterRequest).toBeNull();
    });

    it('should update order correctly', async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });

        const animal1 = await animalRepository.create(generateAnimal());
        const image1 = await animalImageRepository.create(
            generateAnimalImage(animal1),
        );
        const image2 = await animalImageRepository.create(
            generateAnimalImage(animal1, { display_order: 2 }),
        );
        const image3 = await animalImageRepository.create(
            generateAnimalImage(animal1, { display_order: 3 }),
        );
        const image4 = await animalImageRepository.create(
            generateAnimalImage(animal1, { display_order: 4 }),
        );

        const imagesInDb = await animalImageRepository.getAll({
            where: { animal: animal1 },
        });
        expect(imagesInDb.length).toBe(4);

        const response = await request(app)
            .delete(`/animals/${animal1.id}/images/${image2.id}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        expect(response.body.success).toBe(true);

        const image1InDbAfterRequest = await animalImageRepository.getById(image1.id);
        expect(image1InDbAfterRequest?.display_order).toBe(1);

        const image2InDbAfterRequest = await animalImageRepository.getById(image2.id);
        expect(image2InDbAfterRequest).toBeNull();

        const image3InDbAfterRequest = await animalImageRepository.getById(image3.id);
        expect(image3InDbAfterRequest?.display_order).toBe(2);

        const image4InDbAfterRequest = await animalImageRepository.getById(image4.id);
        expect(image4InDbAfterRequest?.display_order).toBe(3);
    });

    it('should return 500 if AWS config is missing', async () => {
        process.env = {};
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });

        const testAnimal = await animalRepository.create(generateAnimal());
        const testImage = await animalImageRepository.create(
            generateAnimalImage(testAnimal),
        );

        const response = await request(app)
            .delete(`/animals/${testAnimal.id}/images/${testImage.id}`)
            .set('x-access-token', 'valid token')
            .expect(500);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.S3_SERVER_ERROR);
    });

    it('should fail if image is not found', async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });

        const testAnimal = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .delete(`/animals/${testAnimal.id}/images/${v4()}`)
            .set('x-access-token', 'valid token')
            .expect(404);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.IMAGE_NOT_FOUND);
    });

    it('should fail if image is not related to the animal', async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });

        const animal1 = await animalRepository.create(generateAnimal());
        const animal2 = await animalRepository.create(generateAnimal());
        const image = await animalImageRepository.create(
            generateAnimalImage(animal1),
        );

        const response = await request(app)
            .delete(`/animals/${animal2.id}/images/${image.id}`)
            .set('x-access-token', 'valid token')
            .expect(403);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.IMAGE_IS_NOT_RELATED_TO_ANIMAL);
    });
});
