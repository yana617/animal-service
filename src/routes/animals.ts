/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import { asyncErrorHandler } from '../middlewares';
import { animalController } from '../controllers/animal.controller';

const router = express.Router();

router.get('/', asyncErrorHandler(animalController.getAll));
// router.post('/', asyncErrorHandler(animalController.createAnimal));

export const animalsRoute = router;
