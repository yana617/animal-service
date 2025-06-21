import request from 'supertest';
import nock from 'nock';
import { v4 } from 'uuid';

import { generateAnimal, generateAnimalImage } from '../../fixtures/db';
import { animalImageRepository } from '../../../repositories/animal-image.repository';
import { animalRepository } from '../../../repositories/animal.repository';
import { app } from '../../fixtures/setup';
import { ERRORS } from '../../../translates';
import { BASE_URL } from '../../fixtures/constants';

const animal1Mock = generateAnimal();
const image1Mock = generateAnimalImage(animal1Mock);
const image2Mock = generateAnimalImage(animal1Mock, { display_order: 2 });
const image3Mock = generateAnimalImage(animal1Mock, { display_order: 3 });
const image4Mock = generateAnimalImage(animal1Mock, { display_order: 4 });
const image5Mock = generateAnimalImage(animal1Mock, { display_order: 5 });

describe('PATCH /animals/:id/images/order', () => {
    let animal1, image1, image2, image3, image4, image5;

    beforeEach(async () => {
        nock(BASE_URL).get('/auth').reply(200, { success: true });
        nock(BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });

        animal1 = await animalRepository.create(animal1Mock);
        image1 = await animalImageRepository.create(image1Mock);
        image2 = await animalImageRepository.create(image2Mock);
        image3 = await animalImageRepository.create(image3Mock);
        image4 = await animalImageRepository.create(image4Mock);
        image5 = await animalImageRepository.create(image5Mock);
    });

    afterEach(async () => {
        await animalImageRepository.deleteAll();
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

    const expectImages1to5ToBe = async (
        first,
        second,
        third,
        forth,
        fifth,
    ): Promise<void> => {
        const image1InDbAfterRequest = await animalImageRepository.getById(
            image1.id,
        );
        expect(image1InDbAfterRequest?.display_order).toBe(first);

        const image2InDbAfterRequest = await animalImageRepository.getById(
            image2.id,
        );
        expect(image2InDbAfterRequest?.display_order).toBe(second);

        const image3InDbAfterRequest = await animalImageRepository.getById(
            image3.id,
        );
        expect(image3InDbAfterRequest?.display_order).toBe(third);

        const image4InDbAfterRequest = await animalImageRepository.getById(
            image4.id,
        );
        expect(image4InDbAfterRequest?.display_order).toBe(forth);

        const image5InDbAfterRequest = await animalImageRepository.getById(
            image5.id,
        );
        expect(image5InDbAfterRequest?.display_order).toBe(fifth);
    };

    it('should update order successfully (2 -> 4)', async () => {
        const response = await request(app)
            .patch(`/animals/${animal1.id}/images/${image2.id}/order`)
            .set('x-access-token', 'valid token')
            .send({ display_order: 4 })
            .expect(200);

        expect(response.body.success).toBe(true);

        await expectImages1to5ToBe(1, 4, 2, 3, 5);
    });

    it('should update order successfully (4 -> 2)', async () => {
        const response = await request(app)
            .patch(`/animals/${animal1.id}/images/${image4.id}/order`)
            .set('x-access-token', 'valid token')
            .send({ display_order: 2 })
            .expect(200);

        expect(response.body.success).toBe(true);

        await expectImages1to5ToBe(1, 3, 4, 2, 5);
    });

    it('should update order successfully (3 -> 5, to last case)', async () => {
        const response = await request(app)
            .patch(`/animals/${animal1.id}/images/${image3.id}/order`)
            .set('x-access-token', 'valid token')
            .send({ display_order: 5 })
            .expect(200);

        expect(response.body.success).toBe(true);

        await expectImages1to5ToBe(1, 2, 5, 3, 4);
    });

    it('should update order successfully (3 -> 1, to first case)', async () => {
        const response = await request(app)
            .patch(`/animals/${animal1.id}/images/${image3.id}/order`)
            .set('x-access-token', 'valid token')
            .send({ display_order: 1 })
            .expect(200);

        expect(response.body.success).toBe(true);

        await expectImages1to5ToBe(2, 3, 1, 4, 5);
    });

    it('should fail if image is not found', async () => {
        const response = await request(app)
            .patch(`/animals/${animal1.id}/images/${v4()}/order`)
            .set('x-access-token', 'valid token')
            .send({ display_order: 4 })
            .expect(404);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.IMAGE_NOT_FOUND);
    });

    it('should fail if image is not related to the animal', async () => {
        const animal2 = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .patch(`/animals/${animal2.id}/images/${image1.id}/order`)
            .set('x-access-token', 'valid token')
            .send({ display_order: 4 })
            .expect(400);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.IMAGE_IS_NOT_RELATED_TO_ANIMAL);
    });

    it('should fail if image order is not provided', async () => {
        const response = await request(app)
            .patch(`/animals/${animal1.id}/images/${image1.id}/order`)
            .set('x-access-token', 'valid token')
            .expect(400);

        expect(response.body.success).toBe(false);
        const { errors } = response.body;
        expect(errors).toBeDefined();
    });

    it('should fail if image order type is wrong', async () => {
        const response = await request(app)
            .patch(`/animals/${animal1.id}/images/${image1.id}/order`)
            .set('x-access-token', 'valid token')
            .send({ display_order: 'hello' })
            .expect(400);

        expect(response.body.success).toBe(false);
        const { errors } = response.body;
        expect(errors).toBeDefined();
    });

    it('should fail if order is bigger than animal\'s images count', async () => {
        const response = await request(app)
            .patch(`/animals/${animal1.id}/images/${image1.id}/order`)
            .set('x-access-token', 'valid token')
            .send({ display_order: 10 })
            .expect(400);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.ORDER_IS_BIGGER_THAN_IMAGES_COUNT);
    });
});
