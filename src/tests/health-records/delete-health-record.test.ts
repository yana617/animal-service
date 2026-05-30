import request from 'supertest';
import nock from 'nock';
import { v4 } from 'uuid';

import { app } from '../fixtures/setup';
import { generateAnimal, generateHealthRecord } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { ERRORS } from '../../translates';
import { animalRepository } from '../../repositories/animal.repository';
import { healthRecordRepository } from '../../repositories/health-record.repository';

describe('DELETE /animals/:id/health-records/:recordId request', () => {
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

    it('should successfully delete a health record', async () => {
        mockAuth();

        const animal = await animalRepository.create(generateAnimal());
        const record = await healthRecordRepository.create(
            generateHealthRecord(animal),
        );

        const response = await request(app)
            .delete(`/animals/${animal.id}/health-records/${record.id}`)
            .set('x-access-token', 'valid token')
            .expect(200);

        expect(response.body.success).toBe(true);

        const deleted = await healthRecordRepository.getById(record.id);
        expect(deleted).toBeNull();
    });

    it('should return 404 when the record does not exist', async () => {
        mockAuth();

        const animal = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .delete(`/animals/${animal.id}/health-records/${v4()}`)
            .set('x-access-token', 'valid token')
            .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.HEALTH_RECORD_NOT_FOUND);
    });

    it('should return 400 when the record does not belong to the animal', async () => {
        mockAuth();

        const animalA = await animalRepository.create(generateAnimal());
        const animalB = await animalRepository.create(generateAnimal());

        const recordOfA = await healthRecordRepository.create(
            generateHealthRecord(animalA),
        );

        const response = await request(app)
            .delete(`/animals/${animalB.id}/health-records/${recordOfA.id}`)
            .set('x-access-token', 'valid token')
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(
            ERRORS.HEALTH_RECORD_IS_NOT_RELATED_TO_ANIMAL,
        );

        const stillExists = await healthRecordRepository.getById(recordOfA.id);
        expect(stillExists).not.toBeNull();
    });

    it('should return 404 when the animal does not exist', async () => {
        mockAuth();

        const animal = await animalRepository.create(generateAnimal());
        const record = await healthRecordRepository.create(
            generateHealthRecord(animal),
        );

        const response = await request(app)
            .delete(`/animals/${v4()}/health-records/${record.id}`)
            .set('x-access-token', 'valid token')
            .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.ANIMAL_NOT_FOUND);
    });

    it('should return 400 when recordId is not a UUID', async () => {
        mockAuth();

        const animal = await animalRepository.create(generateAnimal());

        const response = await request(app)
            .delete(`/animals/${animal.id}/health-records/not-a-uuid`)
            .set('x-access-token', 'valid token')
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
    });

    it('should fail with auth error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        const response = await request(app)
            .delete(`/animals/${v4()}/health-records/${v4()}`)
            .set('x-access-token', 'invalid token')
            .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.AUTH_REQUIRED);
    });

    it('should fail without EDIT_ANIMAL permission', async () => {
        mockAuth([]);

        const response = await request(app)
            .delete(`/animals/${v4()}/health-records/${v4()}`)
            .set('x-access-token', 'valid token')
            .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(ERRORS.FORBIDDEN);
    });

    it('should cascade-delete health records when the animal is deleted', async () => {
        const animal = await animalRepository.create(generateAnimal());
        await healthRecordRepository.create(generateHealthRecord(animal));
        await healthRecordRepository.create(generateHealthRecord(animal));

        await animalRepository.deleteById(animal.id);

        const remaining = await healthRecordRepository.getByAnimalId(animal.id);
        expect(remaining).toHaveLength(0);
    });
});
