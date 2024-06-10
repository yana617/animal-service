import express from 'express';

import { asyncErrorHandler } from '../middlewares';
import { animalController } from '../controllers/animal.controller';
import { getAnimalsQueryValidator } from '../middlewares/validators/get-animals-query';
import { checkValidationErrors } from '../middlewares/check-validation-errors';

const router = express.Router();

router.get(
    '/',
    getAnimalsQueryValidator,
    checkValidationErrors,
    asyncErrorHandler(animalController.getAll)
);
// router.post('/', asyncErrorHandler(animalController.createAnimal));

export const animalsRoute = router;
