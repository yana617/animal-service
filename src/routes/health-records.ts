/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { param } from 'express-validator';

import {
    asyncErrorHandler,
    authRequired,
    checkAnimalExistence,
    checkPermissions,
    checkValidationErrors,
} from '../middlewares';
import { healthRecordController } from '../controllers/health-record.controller';
import { createHealthRecordValidator } from '../middlewares/validators';

const router = express.Router({ mergeParams: true });

router.get(
    '/',
    authRequired,
    asyncErrorHandler(checkAnimalExistence),
    asyncErrorHandler(healthRecordController.getHealthRecords),
);

router.post(
    '/',
    authRequired,
    checkPermissions(['EDIT_ANIMAL']),
    createHealthRecordValidator,
    checkValidationErrors,
    asyncErrorHandler(checkAnimalExistence),
    asyncErrorHandler(healthRecordController.createHealthRecord),
);

router.delete(
    '/:recordId',
    param('recordId').isUUID().notEmpty(),
    checkValidationErrors,
    authRequired,
    checkPermissions(['EDIT_ANIMAL']),
    asyncErrorHandler(checkAnimalExistence),
    asyncErrorHandler(healthRecordController.deleteHealthRecord),
);

export const healthRecordsRoute = router;
