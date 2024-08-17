/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { param } from 'express-validator';

import { asyncErrorHandler, checkValidationErrors } from '../middlewares';
import { animalController } from '../controllers/animal.controller';
import { getAnimalsQueryValidator } from '../middlewares/validators/get-animals-query';

const router = express.Router();

router.get(
    '/',
    getAnimalsQueryValidator,
    checkValidationErrors,
    asyncErrorHandler(animalController.getAll),
);

router.get(
    '/:id',
    param('id').isUUID().notEmpty(),
    checkValidationErrors,
    asyncErrorHandler(animalController.getAnimal),
);

router.post('/', asyncErrorHandler(animalController.createAnimal));

export const animalsRoute = router;
