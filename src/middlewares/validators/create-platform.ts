import { body } from 'express-validator';

export const createPlatformValidator = [
    body('name').isString().isLength({ min: 2, max: 30 }),
];
