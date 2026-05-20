import request from 'supertest';
import nock from 'nock';

import { animalRepository } from '../../../repositories/animal.repository';
import { adRepository } from '../../../repositories/ad.repository';
import { platformRepository } from '../../../repositories/platform.repository';
import { app } from '../../fixtures/setup';
import { generateAnimal, generateAd, generatePlatform } from '../../fixtures/db';
import { AUTH_BASE_URL } from '../../fixtures/constants';
import { AnimalType, Status } from '../../../database/models/animal';

describe('PATCH /animals/:id request - succeed', () => {
    afterEach(async () => {
        await adRepository.deleteAll();
        await platformRepository.deleteAll();
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

    test('Should update animal successfully', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
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

    test('Should delete all ads when animal status changes to ADOPTED', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: ['EDIT_ANIMAL'] });

        const animal = await animalRepository.create(
            generateAnimal({ type: AnimalType.DOG, status: Status.HOMELESS }),
        );
        const platform = await platformRepository.create(generatePlatform());

        await adRepository.create(generateAd(animal, platform));
        await adRepository.create(generateAd(animal, platform));

        const adsBefore = await adRepository.getAll();
        expect(adsBefore).toHaveLength(2);

        await request(app)
            .patch(`/animals/${animal.id}`)
            .set('x-access-token', 'valid token')
            .send({
                ...animal,
                status: Status.ADOPTED,
            })
            .expect(200);

        const animalInDb = await animalRepository.findOne({
            where: { id: animal.id },
        });
        expect(animalInDb?.status).toBe(Status.ADOPTED);

        const adsAfter = await adRepository.getAll();
        expect(adsAfter).toHaveLength(0);
    });
});
