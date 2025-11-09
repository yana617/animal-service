/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { param } from 'express-validator';

import {
    asyncErrorHandler,
    authRequired,
    checkPermissions,
    checkValidationErrors,
} from '../middlewares';
import { platformController } from '../controllers/platform.controller';
import { createPlatformValidator } from '../middlewares/validators';

const router = express.Router();

router.get('/', authRequired, asyncErrorHandler(platformController.getAll));

router.get(
    '/:id',
    param('id').isUUID().notEmpty(),
    authRequired,
    asyncErrorHandler(platformController.getPlatform),
);

router.post(
    '/',
    authRequired,
    checkPermissions(['MANAGE_PLATFORMS']),
    createPlatformValidator,
    checkValidationErrors,
    asyncErrorHandler(platformController.createPlatform),
);

router.delete(
    '/:id',
    authRequired,
    checkPermissions(['MANAGE_PLATFORMS']),
    asyncErrorHandler(platformController.deletePlatform),
);

export const platformsRoute = router;
