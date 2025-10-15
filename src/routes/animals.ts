/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { param } from 'express-validator';

import {
    asyncErrorHandler,
    checkValidationErrors,
    checkAnimalExistence,
    authRequired,
    checkPermissions,
} from '../middlewares';
import { animalController } from '../controllers/animal.controller';
import {
    getAnimalsQueryValidator,
    createUpdateAnimalValidator,
} from '../middlewares/validators';

const router = express.Router();

router.get(
    '/',
    getAnimalsQueryValidator,
    checkValidationErrors,
    asyncErrorHandler(animalController.getAll),
);

router.get(
    '/short',
    getAnimalsQueryValidator,
    checkValidationErrors,
    asyncErrorHandler(animalController.getAllShort),
);

router.get(
    '/:id',
    param('id').isUUID().notEmpty(),
    checkValidationErrors,
    asyncErrorHandler(checkAnimalExistence),
    asyncErrorHandler(animalController.getAnimal),
);

router.post(
    '/',
    authRequired,
    checkPermissions(['CREATE_ANIMAL']),
    createUpdateAnimalValidator,
    checkValidationErrors,
    asyncErrorHandler(animalController.createAnimal),
);

router.patch(
    '/:id',
    authRequired,
    checkPermissions(['EDIT_ANIMAL']),
    createUpdateAnimalValidator,
    checkValidationErrors,
    asyncErrorHandler(checkAnimalExistence),
    asyncErrorHandler(animalController.updateAnimal),
);

router.delete(
    '/:id',
    authRequired,
    checkPermissions(['DELETE_ANIMAL']),
    asyncErrorHandler(checkAnimalExistence),
    asyncErrorHandler(animalController.deleteAnimal),
);

export const animalsRoute = router;
