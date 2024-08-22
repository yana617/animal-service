import { query } from 'express-validator';

import { AnimalType, Place, Sex } from '../../database/models/animal';

export const getAnimalsQueryValidator = [
    query('type').optional().isIn(Object.values(AnimalType)),
    query('sex').optional().isIn(Object.values(Sex)),
    query('status').optional().isString(),
    query('place').optional().isIn(Object.values(Place)),
    query('birthday_from').optional().isISO8601(),
    query('birthday_to').optional().isISO8601(),
    query('order').optional().isIn(['asc', 'desc']),
    query('sortBy').optional().isIn(['name', 'height', 'birthday', 'curator_id', 'second_birthday']),
    query('search').optional().isString(),
    query('height_from').optional().isInt(),
    query('height_to').optional().isInt(),
    query('sterilized').optional().isBoolean(),
    query('room').optional().isFloat({ min: 1, max: 7 }),
    query('limit').optional().isInt(),
    query('skip').optional().isInt(),
];
