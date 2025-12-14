/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import {
    asyncErrorHandler,
    authRequired,
    checkValidationErrors,
    setUser,
} from '../middlewares';
import { adsController } from '../controllers/ad.controller';
import {
    createAdValidator,
    getAdsQueryValidator,
} from '../middlewares/validators';
import { param } from 'express-validator';

const router = express.Router({ mergeParams: true });

router.get(
    '/',
    authRequired,
    getAdsQueryValidator,
    checkValidationErrors,
    asyncErrorHandler(adsController.getAdsForHomeless),
);

router.post(
    '/',
    authRequired,
    createAdValidator,
    checkValidationErrors,
    asyncErrorHandler(adsController.createAd),
);

router.delete(
    '/:id',
    param('id').isUUID().notEmpty(),
    checkValidationErrors,
    authRequired,
    setUser,
    asyncErrorHandler(adsController.deleteAd),
);

export const adsRoute = router;
