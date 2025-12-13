import { body } from 'express-validator';

export const createAdValidator = [
    body('date').isISO8601(),
    body('user_id').isUUID(),
    body('animal_id').isUUID(),
    body('platform_id').isUUID(),
];
