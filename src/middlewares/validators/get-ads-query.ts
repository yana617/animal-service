import { query } from 'express-validator';

export const getAdsQueryValidator = [
    query('sortOrder').optional().isIn(['ASC', 'DESC']),
    query('sortByPlatform').optional().isUUID(),
];
