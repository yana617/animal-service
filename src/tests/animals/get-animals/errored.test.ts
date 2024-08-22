// import request from 'supertest';
// import nock from 'nock';

// import { animalRepository } from '../../../repositories/animal.repository';
// import { app } from '../../fixtures/setup';

// describe('GET /animals', () => {
//     beforeEach(async () => {
//         await animalRepository.deleteAll();
//         nock.cleanAll();
//     });

//     test('Should fail with incorrect filters', async () => {
//         const response = await request(app)
//             .get('/animals?birthday_from=hi')
//             .set('x-access-token', 'valid token')
//             .expect(400);

//         const { errors } = response.body;
//         expect(errors).toBeDefined();

//         const response2 = await request(app)
//             .get('/animals?type=non-exist')
//             .set('x-access-token', 'valid token')
//             .expect(400);

//         const { errors: errors2 } = response2.body;
//         expect(errors2).toBeDefined();
//     });
// });
