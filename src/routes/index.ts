/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import { animalsRoute } from './animals';
import { animalImagesRoute } from './animal-images';
import { platformsRoute } from './platforms';
import { statsRoute } from './stats';
import { adsRoute } from './ads';
import { documentsRoute } from './documents';
import { checkValidationErrors } from '../middlewares';
import { param } from 'express-validator';

const router = express.Router();

router.use('/animals', animalsRoute);
router.use(
    '/animals/:id/images',
    param('id').isUUID().notEmpty(),
    checkValidationErrors,
    animalImagesRoute,
);
router.use('/platforms', platformsRoute);
router.use('/stats', statsRoute);
router.use('/ads', adsRoute);
router.use('/documents', documentsRoute);

export default router;
