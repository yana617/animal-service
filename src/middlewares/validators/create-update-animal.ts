import { body } from 'express-validator';

import { AnimalType, Place, Sex, Status } from '../../database/models/animal';

export const createUpdateAnimalValidator = [
    body('type').isIn(Object.values(AnimalType)),
    body('sex').isIn(Object.values(Sex)),
    body('status').isIn(Object.values(Status)),
    body('place').isIn(Object.values(Place)),
    body('room').optional().isInt({ min: 1, max: 7 }),
    body('birthday').isISO8601(),
    body('second_birthday').isISO8601(),
    body('height').optional({ nullable: true }).isInt({ min: 10, max: 80 }),
    body('sterilized').isBoolean(),
    body('curator_id').optional({ nullable: true }).isUUID(),
    body('health_details').optional({ nullable: true }).isString(),
    body('advertising_text').optional().isString(),
    body('description').optional({ nullable: true }).isString(),
];
