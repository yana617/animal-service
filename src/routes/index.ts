import express from 'express';

import { animalsRoute } from './animals';

const router = express.Router();

router.use('/animals', animalsRoute);

export default router;
