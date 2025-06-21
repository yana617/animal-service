import { body } from 'express-validator';

export const updateImageOrderValidator = [
    body('display_order').isInt({ min: 1, max: 20 }),
];
