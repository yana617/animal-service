import { type Response } from 'express';

import { type Animal } from '../database/models/animal';
import { ERRORS } from '../translates';
import { AnimalImage } from '../database/entities/animal-image.entity';
import { animalImageRepository } from '../repositories/animal-image.repository';
import { updateImageOrder } from '../utils/update-image-order';
import { deleteImageFromAWS } from '../utils/delete-image-from-AWS';
import {
    type FileType,
    type RequestWithAnimal,
    type ImageRequestParams,
    type UpdateOrderRequestBody,
} from './types';

const uploadImages = async (
    req: RequestWithAnimal<{ id: string }, Omit<Animal, 'id'>>,
    res: Response,
): Promise<void> => {
    const files = req.files as FileType[];

    const existedImages = await animalImageRepository.getImagesByAnimal(
        req.animal,
    );
    const animalImagesCount = existedImages.length;

    for (let i = 0; i < files.length; i++) {
        const image = new AnimalImage();
        image.image_key = files[i].key;
        image.display_order = animalImagesCount + i + 1;
        image.animal = req.animal;
        await animalImageRepository.create(image);
    }

    res.json({
        success: true,
    });
};

const updateOrder = async (
    req: RequestWithAnimal<ImageRequestParams, UpdateOrderRequestBody>,
    res: Response,
): Promise<void> => {
    const { imageId } = req.params;
    const { display_order: newOrder } = req.body;

    const imageToUpdate = await animalImageRepository.getById(imageId, [
        'animal',
    ]);

    if (!imageToUpdate) {
        res.status(404).json({ success: false, error: ERRORS.IMAGE_NOT_FOUND });
        return;
    }

    if (imageToUpdate.animal.id !== req.params.id) {
        res.status(400).json({
            success: false,
            error: ERRORS.IMAGE_IS_NOT_RELATED_TO_ANIMAL,
        });
        return;
    }

    const animalImages = await animalImageRepository.getImagesByAnimal(
        req.animal,
    );

    const currentOrder = imageToUpdate.display_order;
    const animalId = imageToUpdate.animal.id;

    if (currentOrder === newOrder) {
        res.json({ success: true });
        return;
    }

    if (newOrder > animalImages.length) {
        res.status(400).json({
            success: false,
            error: ERRORS.ORDER_IS_BIGGER_THAN_IMAGES_COUNT,
        });
        return;
    }

    await updateImageOrder({
        animalId,
        currentOrder,
        newOrder,
        isMovingUp: newOrder > currentOrder,
        imageId,
    });

    res.json({ success: true });
};

const deleteImage = async (
    req: RequestWithAnimal<ImageRequestParams, unknown>,
    res: Response,
): Promise<any> => {
    const { id: animalId, imageId } = req.params;

    const image = await animalImageRepository.getById(imageId, ['animal']);

    if (!image) {
        return res
            .status(404)
            .json({ success: false, error: ERRORS.IMAGE_NOT_FOUND });
    }

    if (image.animal.id !== animalId) {
        return res.status(403).json({
            success: false,
            error: ERRORS.IMAGE_IS_NOT_RELATED_TO_ANIMAL,
        });
    }

    try {
        await deleteImageFromAWS(image.image_key);
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }

    await animalImageRepository.remove(image);

    // decrease order for other pictures

    await animalImageRepository
        .createQueryBuilder()
        .update(AnimalImage)
        .set({
            display_order: () => 'display_order - 1',
        })
        .where('animal_id = :animalId AND display_order > :deleteImageOrder', {
            animalId,
            deleteImageOrder: image.display_order,
        })
        .execute();

    res.json({ success: true });
};

export const animalImageController = {
    uploadImages,
    updateOrder,
    deleteImage,
};
