/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import {
    asyncErrorHandler,
    authRequired,
    checkPermissions,
} from '../middlewares';
import { statsController } from '../controllers/stats.controller';

const router = express.Router();

router.get(
    '/animals-per-age',
    authRequired,
    checkPermissions(['VIEW_RATING']),
    asyncErrorHandler(statsController.getAnimalsPerAge),
);

router.get(
    '/adopted-per-month',
    authRequired,
    checkPermissions(['VIEW_RATING']),
    asyncErrorHandler(statsController.getAdoptedAnimalsPerMonth),
);

export const statsRoute = router;
