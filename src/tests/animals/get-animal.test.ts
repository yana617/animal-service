import request from 'supertest';
import nock from 'nock';

import { animalRepository } from '../../repositories/animal.repository';
import { healthRecordRepository } from '../../repositories/health-record.repository';
import { app } from '../fixtures/setup';
import { generateAnimal, generateHealthRecord } from '../fixtures/db';
import { AUTH_BASE_URL } from '../fixtures/constants';
import { ERRORS } from '../../translates';
import { HealthRecordType } from '../../database/models/health-record';

describe('GET /animals/:id request', () => {
    afterEach(async () => {
        await healthRecordRepository.deleteAll();
        await animalRepository.deleteAll();
        nock.cleanAll();
    });

    test('Should return correct animal', async () => {
        const animalOne = generateAnimal();
        await animalRepository.create(animalOne);

        const response = await request(app)
            .get(`/animals/${animalOne.id}`)
            .expect(200);

        const { data: animal } = response.body;
        expect(animal).toHaveProperty('name', animalOne.name);
        expect(animal).toHaveProperty('sex', animalOne.sex);
    });

    test('Should fail with not found error', async () => {
        const animalOne = generateAnimal();
        const response = await request(app)
            .get(`/animals/${animalOne.id}`)
            .expect(404);

        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.ANIMAL_NOT_FOUND);
    });

    test('Should fail if id is invalid format', async () => {
        const response = await request(app)
            .get('/animals/invalid-id')
            .expect(400);

        const { errors } = response.body;
        expect(errors).toBeDefined();
    });

    describe('health_records visibility', () => {
        const mockPermissions = (permissions: string[]): void => {
            nock(AUTH_BASE_URL)
                .get('/permissions/me')
                .reply(200, { success: true, data: permissions });
        };

        test('Should return empty health_records array when animal has no records and no token provided', async () => {
            const animal = await animalRepository.create(generateAnimal());

            const response = await request(app)
                .get(`/animals/${animal.id}`)
                .expect(200);

            expect(response.body.data.health_records).toEqual([]);
        });

        test('Should return only the latest vaccination when no token is provided', async () => {
            const animal = await animalRepository.create(generateAnimal());

            const olderVaccine = await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.VACCINE,
                    date: new Date('2023-01-01'),
                }),
            );
            const latestVaccine = await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.VACCINE,
                    date: new Date('2024-06-01'),
                }),
            );
            await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.DEWORMING,
                    date: new Date('2024-12-01'),
                }),
            );

            const response = await request(app)
                .get(`/animals/${animal.id}`)
                .expect(200);

            expect(response.body.data.health_records).toHaveLength(1);
            expect(response.body.data.health_records[0].id).toBe(
                latestVaccine.id,
            );
            expect(response.body.data.health_records[0].type).toBe(
                HealthRecordType.VACCINE,
            );
            expect(response.body.data.health_records[0].id).not.toBe(
                olderVaccine.id,
            );
        });

        test('Should return only the latest vaccination when token is provided but user lacks VIEW_ANIMAL permission', async () => {
            mockPermissions([]);

            const animal = await animalRepository.create(generateAnimal());

            const latestVaccine = await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.VACCINE,
                    date: new Date('2024-06-01'),
                }),
            );
            await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.VET_VISIT,
                    date: new Date('2024-12-01'),
                }),
            );

            const response = await request(app)
                .get(`/animals/${animal.id}`)
                .set('x-access-token', 'valid token')
                .expect(200);

            expect(response.body.data.health_records).toHaveLength(1);
            expect(response.body.data.health_records[0].id).toBe(
                latestVaccine.id,
            );
        });

        test('Should return empty health_records array when no vaccination exists and user lacks VIEW_ANIMAL permission', async () => {
            const animal = await animalRepository.create(generateAnimal());

            await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.VET_VISIT,
                    date: new Date('2024-12-01'),
                }),
            );
            await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.DEWORMING,
                    date: new Date('2024-10-01'),
                }),
            );

            const response = await request(app)
                .get(`/animals/${animal.id}`)
                .expect(200);

            expect(response.body.data.health_records).toEqual([]);
        });

        test('Should return all health records when user has VIEW_ANIMAL permission', async () => {
            mockPermissions(['VIEW_ANIMAL']);

            const animal = await animalRepository.create(generateAnimal());

            await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.VACCINE,
                    date: new Date('2024-01-01'),
                }),
            );
            await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.DEWORMING,
                    date: new Date('2024-06-01'),
                }),
            );
            await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.VET_VISIT,
                    date: new Date('2024-12-01'),
                }),
            );

            const response = await request(app)
                .get(`/animals/${animal.id}`)
                .set('x-access-token', 'valid token')
                .expect(200);

            expect(response.body.data.health_records).toHaveLength(3);
            // Records are ordered by date DESC
            expect(response.body.data.health_records[0].type).toBe(
                HealthRecordType.VET_VISIT,
            );
            expect(response.body.data.health_records[1].type).toBe(
                HealthRecordType.DEWORMING,
            );
            expect(response.body.data.health_records[2].type).toBe(
                HealthRecordType.VACCINE,
            );
        });

        test('Should fall back to latest vaccination when auth service fails', async () => {
            nock(AUTH_BASE_URL).get('/permissions/me').reply(500);

            const animal = await animalRepository.create(generateAnimal());

            const latestVaccine = await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.VACCINE,
                    date: new Date('2024-06-01'),
                }),
            );
            await healthRecordRepository.create(
                generateHealthRecord(animal, {
                    type: HealthRecordType.LAB_TEST,
                    date: new Date('2024-12-01'),
                }),
            );

            const response = await request(app)
                .get(`/animals/${animal.id}`)
                .set('x-access-token', 'valid token')
                .expect(200);

            expect(response.body.data.health_records).toHaveLength(1);
            expect(response.body.data.health_records[0].id).toBe(
                latestVaccine.id,
            );
        });
    });
});
