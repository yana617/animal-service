import express from 'express';

import { animalsRoute } from './animals';
import { animalImagesRoute } from './animal-images';

const router = express.Router();

router.use('/animals', animalsRoute);
router.use('/animals/:id/images', animalImagesRoute);

export default router;
