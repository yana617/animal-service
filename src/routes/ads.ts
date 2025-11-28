/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import {
    asyncErrorHandler,
    authRequired,
    checkValidationErrors,
} from '../middlewares';
import { adsController } from '../controllers/ad.controller';
import { getAdsQueryValidator } from '../middlewares/validators';

const router = express.Router({ mergeParams: true });

router.get(
    '/',
    authRequired,
    getAdsQueryValidator,
    checkValidationErrors,
    asyncErrorHandler(adsController.getAdsForHomeless),
);

export const adsRoute = router;
