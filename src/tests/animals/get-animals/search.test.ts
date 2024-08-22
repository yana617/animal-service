import request from 'supertest';
import nock from 'nock';

import { generateAnimal } from '../../fixtures/db';
import { animalRepository } from '../../../repositories/animal.repository';
import { AUTH_SERVICE_URL } from '../../../constant/auth-service-url';
import { app } from '../../fixtures/setup';

describe('GET /animals', () => {
    beforeEach(async () => {
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

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

        const { data: res } = response.body;
        expect(res.animals?.length).toEqual(1);
        expect(res.animals?.[0].name).toBe('Ari');

        // -----

        const response2 = await request(app)
            .get('/animals?search=da')
            .set('x-access-token', 'valid token')
            .expect(200);

        const { data: res2 } = response2.body;
        expect(res2.animals.length).toEqual(2);
    });
});
