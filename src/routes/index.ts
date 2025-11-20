import express from 'express';

import { animalsRoute } from './animals';
import { animalImagesRoute } from './animal-images';
import { platformsRoute } from './platform';

const router = express.Router();

router.use('/animals', animalsRoute);
router.use('/animals/:id/images', animalImagesRoute);
router.use('/platforms', platformsRoute);

export default router;
