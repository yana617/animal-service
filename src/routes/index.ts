import express from 'express';

import { animalsRoute } from './animals';
import { animalImagesRoute } from './animal-images';
import { platformsRoute } from './platform';
import { statsRoute } from './stats';

const router = express.Router();

router.use('/animals', animalsRoute);
router.use('/animals/:id/images', animalImagesRoute);
router.use('/platforms', platformsRoute);
router.use('/stats', statsRoute);

export default router;
