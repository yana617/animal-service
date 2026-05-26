import request from 'supertest';
import nock from 'nock';
import { v4 } from 'uuid';

import { app } from '../fixtures/setup';
import { generateAnimal } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { ERRORS } from '../../translates';
import { animalRepository } from '../../repositories/animal.repository';
import { healthRecordRepository } from '../../repositories/health-record.repository';
import { HealthRecordType } from '../../database/models/health-record';

describe('POST /animals/:id/health-records request', () => {
    afterEach(async () => {
        await healthRecordRepository.deleteAll();
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

    const mockAuth = (permissions: string[] = ['EDIT_ANIMAL']): void => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });
        nock(AUTH_BASE_URL)
            .get('/permissions/me')
            .reply(200, { success: true, data: permissions });
    };

    it('should successfully create a vaccine record', async () => {
        mockAuth();

        const animal = await animalRepository.create(generateAnimal());

        const requestBody = {
            type: HealthRecordType.VACCINE,
            date: '2024-05-20',
            drug_name: 'Nobivac DHPPi',
            next_due_date: '2025-05-20',
            notes: 'Annual booster',
        };

        const response = await request(app)
            .post(`/animals/${animal.id}/health-records`)
            .set('x-access-token', 'valid token')
            .send(requestBody)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
            type: HealthRecordType.VACCINE,
            drug_name: 'Nobivac DHPPi',
            notes: 'Annual booster',
            animal: expect.objectContaining({ id: animal.id }),
        });

        const records = await healthRecordRepository.getByAnimalId(animal.id);
        expect(records).toHaveLength(1);
    });

    it('should successfully create a vet-visit record with files', async () => {
        mockAuth();

        const animal = await animalRepository.create(generateAnimal());

        const requestBody = {
            type: HealthRecordType.VET_VISIT,
            date: '2024-05-20',
            notes: 'Routine check-up, all good',
            files: [
                {
                    name: 'report.pdf',
                    link: 'https://s3.example.com/docs/abc.pdf',
                },
            ],
        };

        const response = await request(app)
            .post(`/animals/${animal.id}/health-records`)
            .set('x-access-token', 'valid token')
            .send(requestBody)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.type).toBe(HealthRecordType.VET_VISIT);
        expect(response.body.data.files).toHaveLength(1);
        expect(response.body.data.files[0]).toMatchObject({
            name: 'report.pdf',
            link: 'https://s3.example.com/docs/abc.pdf',
        });
    });

    it('should return 400 when required fields are missing', async () => {
        mockAuth();

        const animal = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .post(`/animals/${animal.id}/health-records`)
            .set('x-access-token', 'valid token')
            .send({})
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
    });

    it('should return 400 when type is invalid', async () => {
        mockAuth();

        const animal = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .post(`/animals/${animal.id}/health-records`)
            .set('x-access-token', 'valid token')
            .send({
                type: 'unknown-type',
                date: '2024-05-20',
            })
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
    });

    it('should return 400 when date is invalid', async () => {
        mockAuth();

        const animal = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .post(`/animals/${animal.id}/health-records`)
            .set('x-access-token', 'valid token')
            .send({
                type: HealthRecordType.VACCINE,
                date: 'not-a-date',
            })
            .expect(400);

        expect(response.body.success).toBe(false);
    });

    it('should return 404 when animal does not exist', async () => {
        mockAuth();

        const response = await request(app)
            .post(`/animals/${v4()}/health-records`)
            .set('x-access-token', 'valid token')
            .send({
                type: HealthRecordType.VACCINE,
                date: '2024-05-20',
            })
            .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.ANIMAL_NOT_FOUND);
    });

    it('should fail with auth error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        const response = await request(app)
            .post(`/animals/${v4()}/health-records`)
            .set('x-access-token', 'invalid token')
            .send({})
            .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.AUTH_REQUIRED);
    });

    it('should fail without EDIT_ANIMAL permission', async () => {
        mockAuth([]);

        const animal = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .post(`/animals/${animal.id}/health-records`)
            .set('x-access-token', 'valid token')
            .send({
                type: HealthRecordType.VACCINE,
                date: '2024-05-20',
            })
            .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.FORBIDDEN);
    });
});