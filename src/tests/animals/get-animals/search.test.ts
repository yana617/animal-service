import request from 'supertest';
import nock from 'nock';

import { generateAnimal } from '../../fixtures/db';
import { animalRepository } from '../../../repositories/animal.repository';
import { AUTH_SERVICE_URL } from '../../../constant/auth-service-url';
import { app } from '../../fixtures/setup';

beforeEach(async () => {
    await animalRepository.deleteAll();
    nock.cleanAll();
});

describe('GET /animals', () => {
    test('Should return searched animals', async () => {
        nock(AUTH_SERVICE_URL).get('/auth').reply(200, { success: true });

        await animalRepository.create(
            generateAnimal({
                name: 'Ari',
            }),
        );
        await animalRepository.create(
            generateAnimal({
                name: 'Wanda',
            }),
        );
        await animalRepository.create(
            generateAnimal({
                name: 'Ozzy',
            }),
        );
        await animalRepository.create(
            generateAnimal({
                name: 'Danya',
            }),
        );

        const response = await request(app)
            .get('/animals?search=ari')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals } = response.body;
        expect(animals?.length).toEqual(1);
        expect(animals?.[0].name).toBe('Ari');

        // -----

        const response2 = await request(app)
            .get('/animals?search=da')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: animals2 } = response2.body;
        expect(animals2?.length).toEqual(2);
    });
});
