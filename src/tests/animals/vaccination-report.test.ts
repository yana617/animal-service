import request from 'supertest';

import { animalRepository } from '../../repositories/animal.repository';
import { healthRecordRepository } from '../../repositories/health-record.repository';
import { app } from '../fixtures/setup';
import { generateAnimal, generateHealthRecord } from '../fixtures/db';
import { AnimalType, Status } from '../../database/models/animal';
import { HealthRecordType } from '../../database/models/health-record';

describe('GET /animals/vaccination-report request', () => {
    afterEach(async () => {
        await healthRecordRepository.deleteAll();
        await animalRepository.deleteAll();
    });

    test('Should return a PDF file with vaccination records of homeless / preparation dogs and cats', async () => {
        const dog = await animalRepository.create(
            generateAnimal({
                type: AnimalType.DOG,
                status: Status.HOMELESS,
                name: 'Rex',
            }),
        );
        const cat = await animalRepository.create(
            generateAnimal({
                type: AnimalType.CAT,
                status: Status.PREPARATION,
                name: 'Whiskers',
            }),
        );
        const adoptedDog = await animalRepository.create(
            generateAnimal({
                type: AnimalType.DOG,
                status: Status.ADOPTED,
                name: 'Buddy',
            }),
        );

        await healthRecordRepository.create(
            generateHealthRecord(dog, {
                type: HealthRecordType.VACCINE,
                drug_name: 'Nobivac',
            }),
        );
        await healthRecordRepository.create(
            generateHealthRecord(cat, {
                type: HealthRecordType.VACCINE,
                drug_name: 'Felocell',
            }),
        );
        // Should NOT appear: adopted animal
        await healthRecordRepository.create(
            generateHealthRecord(adoptedDog, {
                type: HealthRecordType.VACCINE,
                drug_name: 'Eurican',
            }),
        );
        // Should NOT appear: non-vaccine record
        await healthRecordRepository.create(
            generateHealthRecord(dog, {
                type: HealthRecordType.DEWORMING,
                drug_name: 'Drontal',
            }),
        );

        const response = await request(app)
            .get('/animals/vaccination-report')
            .expect(200)
            .expect('Content-Type', 'application/pdf')
            .buffer(true)
            .parse((res: any, callback: any) => {
                const chunks: Uint8Array[] = [];
                res.on('data', (chunk: Uint8Array) => chunks.push(chunk));
                res.on('end', () => {
                    callback(null, Buffer.concat(chunks));
                });
            });

        const pdfBuffer: Buffer = response.body;
        expect(pdfBuffer.length).toBeGreaterThan(0);
        // PDF files always start with "%PDF-"
        expect(pdfBuffer.slice(0, 5).toString()).toBe('%PDF-');
    });
});
