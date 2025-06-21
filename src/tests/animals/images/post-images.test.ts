import request from 'supertest';
import nock from 'nock';
import { v4 } from 'uuid';

import { generateAnimal, generateAnimalImage } from '../../fixtures/db';
import { animalImageRepository } from '../../../repositories/animal-image.repository';
import { animalRepository } from '../../../repositories/animal.repository';
import { app } from '../../fixtures/setup';
import { imageKeyMock } from '../../fixtures/mocks/libs';
import { ERRORS } from '../../../translates';
import { BASE_URL } from '../../fixtures/constants';

describe('POST /animals/:id/images - uploadImages', () => {
    afterEach(async () => {
        await animalImageRepository.deleteAll();
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

    it('should upload valid images', async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });

        const testAnimal = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .post(`/animals/${testAnimal.id}/images`)
            .set('x-access-token', 'valid token')
            .attach('file1', Buffer.from('test content'), 'test1.jpg')
            .expect(200);

        expect(response.body.success).toBe(true);

        const createdImage = await animalImageRepository.findOne({
            where: { animal: testAnimal },
        });

        expect(createdImage?.image_key).toBe(imageKeyMock);
    });

    it('should increment display_order correctly', async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });

        const testAnimal = await animalRepository.create(generateAnimal());

        await animalImageRepository.create(generateAnimalImage(testAnimal));
        await animalImageRepository.create(
            generateAnimalImage(testAnimal, { display_order: 2 }),
        );

        const response = await request(app)
            .post(`/animals/${testAnimal.id}/images`)
            .set('x-access-token', 'valid token')
            .attach('file1', Buffer.from('test content'), 'test1.jpg')
            .expect(200);

        expect(response.body.success).toBe(true);

        const animalImages = await animalImageRepository.getImagesByAnimal(
            testAnimal,
        );

        expect(animalImages.length).toBe(3);

        const createdImage = animalImages.find(
            (image) => image.image_key === imageKeyMock,
        );
        expect(createdImage?.display_order).toBe(3);
    });

    it('should fail if animal is not exist', async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });

        const response = await request(app)
            .post(`/animals/${v4()}/images`)
            .set('x-access-token', 'valid token')
            .attach('file1', Buffer.from('test content'), 'test1.jpg')
            .expect(404);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.ANIMAL_NOT_FOUND);
    });

    it('should fail with auth error', async () => {
        nock(BASE_URL).get('/auth').reply(401, { success: false });

        const response = await request(app)
            .post('/animals/invalid-id/images')
            .set('x-access-token', 'valid token')
            .expect(401);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.AUTH_REQUIRED);
    });

    it('should fail with not enough permissions error', async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: [] });

        const response = await request(app)
            .post('/animals/invalid-id/images')
            .set('x-access-token', 'valid token')
            .expect(403);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.FORBIDDEN);
    });
});
