/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import { asyncErrorHandler, authRequired } from '../middlewares';
import { uploadDocuments } from '../utils/multer-documents';
import { documentController } from '../controllers/document.controller';

const router = express.Router();

router.post(
    '/',
    authRequired,
    uploadDocuments.any(),
    asyncErrorHandler(documentController.uploadDocuments),
);

export const documentsRoute = router;
