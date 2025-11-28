import express from 'express';

import { animalsRoute } from './animals';
import { animalImagesRoute } from './animal-images';
import { platformsRoute } from './platforms';
import { statsRoute } from './stats';
import { adsRoute } from './ads';

const router = express.Router();

router.use('/animals', animalsRoute);
router.use('/animals/:id/images', animalImagesRoute);
router.use('/platforms', platformsRoute);
router.use('/stats', statsRoute);
router.use('/ads', adsRoute);

export default router;
