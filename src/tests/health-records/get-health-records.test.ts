import request from 'supertest';
import nock from 'nock';
import { v4 } from 'uuid';

import { app } from '../fixtures/setup';
import { generateAnimal, generateHealthRecord } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { ERRORS } from '../../translates';
import { animalRepository } from '../../repositories/animal.repository';
import { healthRecordRepository } from '../../repositories/health-record.repository';
import { HealthRecordType } from '../../database/models/health-record';

describe('GET /animals/:id/health-records request', () => {
    afterEach(async () => {
        await healthRecordRepository.deleteAll();
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

    it('should return health records sorted by date DESC', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const animal = await animalRepository.create(generateAnimal());

        const earlier = new Date('2024-01-01');
        const later = new Date('2024-06-01');

        await healthRecordRepository.create(
            generateHealthRecord(animal, {
                type: HealthRecordType.VACCINE,
                date: earlier,
            }),
        );
        await healthRecordRepository.create(
            generateHealthRecord(animal, {
                type: HealthRecordType.DEWORMING,
                date: later,
            }),
        );

        const response = await request(app)
            .get(`/animals/${animal.id}/health-records`)
            .set('x-access-token', 'valid token')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0].type).toBe(HealthRecordType.DEWORMING);
        expect(response.body.data[1].type).toBe(HealthRecordType.VACCINE);
    });

    it('should filter records by type', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const animal = await animalRepository.create(generateAnimal());

        await healthRecordRepository.create(
            generateHealthRecord(animal, { type: HealthRecordType.VACCINE }),
        );
        await healthRecordRepository.create(
            generateHealthRecord(animal, { type: HealthRecordType.VET_VISIT }),
        );
        await healthRecordRepository.create(
            generateHealthRecord(animal, { type: HealthRecordType.LAB_TEST }),
        );

        const response = await request(app)
            .get(`/animals/${animal.id}/health-records?type=vet-visit`)
            .set('x-access-token', 'valid token')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].type).toBe(HealthRecordType.VET_VISIT);
    });

    it('should return only records for the specified animal', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const animalA = await animalRepository.create(generateAnimal());
        const animalB = await animalRepository.create(generateAnimal());

        await healthRecordRepository.create(generateHealthRecord(animalA));
        await healthRecordRepository.create(generateHealthRecord(animalA));
        await healthRecordRepository.create(generateHealthRecord(animalB));

        const response = await request(app)
            .get(`/animals/${animalA.id}/health-records`)
            .set('x-access-token', 'valid token')
            .expect(200);

        expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when animal has no health records', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const animal = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .get(`/animals/${animal.id}/health-records`)
            .set('x-access-token', 'valid token')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([]);
    });

    it('should return 404 when animal does not exist', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const response = await request(app)
            .get(`/animals/${v4()}/health-records`)
            .set('x-access-token', 'valid token')
            .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.ANIMAL_NOT_FOUND);
    });

    it('should return 400 when animal id is not a UUID', async () => {
        const response = await request(app)
            .get('/animals/not-a-uuid/health-records')
            .set('x-access-token', 'valid token')
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
    });

    it('should fail with auth error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        const response = await request(app)
            .get(`/animals/${v4()}/health-records`)
            .set('x-access-token', 'invalid token')
            .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.AUTH_REQUIRED);
    });
});