import { query } from 'express-validator';

import { AnimalType, Place, Sex } from '../../database/models/animal';

export const getAnimalsQueryValidator = [
    query("type").optional().isIn(Object.values(AnimalType)),
    query("sex").optional().isIn(Object.values(Sex)),
    query("status").optional().isString(),
    query("place").optional().isIn(Object.values(Place)),
    query("birthday_from").optional().isISO8601(),
    query("birthday_to").optional().isISO8601(),
    query("order").optional().isIn(['ASC', 'DESC']),
    query("sortBy").optional().isIn(['name', 'birthday', 'curator_id', 'secondBirthday']),
    query("search").optional().isString(),    
];
