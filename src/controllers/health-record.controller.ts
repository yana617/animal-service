import { type Request, type Response } from 'express';

import { ERRORS } from '../translates';
import { healthRecordRepository } from '../repositories/health-record.repository';
import {
    type HealthRecordType,
    type HealthRecordFile,
} from '../database/models/health-record';
import { type RequestWithAnimal } from './types';

const getHealthRecords = async (
    req: RequestWithAnimal<{ id: string }, unknown> & {
        query: { type?: HealthRecordType };
    },
    res: Response,
): Promise<void> => {
    const { type } = req.query;

    const records = await healthRecordRepository.getByAnimalId(
        req.animal.id,
        type,
    );

    res.json({
        success: true,
        data: records,
    });
};

const createHealthRecord = async (
    req: RequestWithAnimal<
        { id: string },
        {
            type: HealthRecordType;
            date: string;
            drug_name?: string;
            next_due_date?: string;
            notes?: string;
            files?: HealthRecordFile[];
        }
    >,
    res: Response,
): Promise<void> => {
    const { type, date, drug_name, next_due_date, notes, files } = req.body;

    const created = await healthRecordRepository.create({
        type,
        date: new Date(date),
        drug_name,
        next_due_date: next_due_date ? new Date(next_due_date) : undefined,
        notes,
        files,
        animal: req.animal,
    });

    res.json({
        success: true,
        data: created,
    });
};

const deleteHealthRecord = async (
    req: Request<{ id: string; recordId: string }>,
    res: Response,
): Promise<void> => {
    const { id: animalId, recordId } = req.params;

    const record = await healthRecordRepository.getById(recordId, ['animal']);

    if (!record) {
        res.status(404).json({
            success: false,
            error: ERRORS.HEALTH_RECORD_NOT_FOUND,
        });
        return;
    }

    if (record.animal.id !== animalId) {
        res.status(400).json({
            success: false,
            error: ERRORS.HEALTH_RECORD_IS_NOT_RELATED_TO_ANIMAL,
        });
        return;
    }

    await healthRecordRepository.deleteById(recordId);

    res.json({ success: true });
};

export const healthRecordController = {
    getHealthRecords,
    createHealthRecord,
    deleteHealthRecord,
};
