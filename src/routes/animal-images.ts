/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import {
    asyncErrorHandler,
    authRequired,
    checkAnimalExistence,
    checkPermissions,
    checkValidationErrors,
} from '../middlewares';
import { upload } from '../utils/multer';
import { animalImageController } from '../controllers/animal-image.controller';
import { updateImageOrderValidator } from '../middlewares/validators';

const router = express.Router({ mergeParams: true });

router.post(
    '/',
    authRequired,
    checkPermissions(['EDIT_ANIMAL']),
    asyncErrorHandler(checkAnimalExistence),
    upload.any(),
    asyncErrorHandler(animalImageController.uploadImages),
);

router.patch(
    '/:imageId/order',
    updateImageOrderValidator,
    checkValidationErrors,
    authRequired,
    checkPermissions(['EDIT_ANIMAL']),
    asyncErrorHandler(checkAnimalExistence),
    asyncErrorHandler(animalImageController.updateOrder),
);

router.delete(
    '/:imageId',
    authRequired,
    checkPermissions(['EDIT_ANIMAL']),
    asyncErrorHandler(checkAnimalExistence),
    asyncErrorHandler(animalImageController.deleteImage),
);

export const animalImagesRoute = router;
