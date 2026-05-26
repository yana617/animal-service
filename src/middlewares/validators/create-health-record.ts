import { body } from 'express-validator';

import { HealthRecordType } from '../../database/models/health-record';

export const createHealthRecordValidator = [
    body('type').isIn(Object.values(HealthRecordType)),
    body('date').isISO8601(),
    body('drug_name').optional().isString().notEmpty(),
    body('next_due_date').optional().isISO8601(),
    body('notes').optional().isString(),
    body('files').optional().isArray(),
    body('files.*.name').optional().isString().notEmpty(),
    body('files.*.link').optional().isString().notEmpty(),
];
