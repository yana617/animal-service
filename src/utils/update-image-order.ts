import { AnimalImage } from '../database/entities/animal-image.entity';
import { animalImageRepository } from '../repositories/animal-image.repository';

export const updateImageOrder = async ({
    isMovingUp,
    animalId,
    currentOrder,
    newOrder,
    imageId,
}: {
    isMovingUp: boolean;
    animalId: string;
    currentOrder: number;
    newOrder: number;
    imageId: string;
}): Promise<void> => {
    await animalImageRepository.updateByIdPartially(imageId, {
        display_order: 999,
    });

    // temporarily make them negative
    await animalImageRepository
        .createQueryBuilder()
        .update(AnimalImage)
        .set({
            display_order: () => '-display_order',
        })
        .where(
            isMovingUp
                ? 'animal_id = :animalId AND display_order > :currentOrder AND display_order <= :newOrder'
                : 'animal_id = :animalId AND display_order >= :newOrder AND display_order < :currentOrder',
            {
                animalId,
                newOrder,
                currentOrder,
            },
        )
        .execute();

    // update to new values
    await animalImageRepository
        .createQueryBuilder()
        .update(AnimalImage)
        .set({
            display_order: () =>
                isMovingUp
                    ? 'ABS(display_order) - 1'
                    : 'ABS(display_order) + 1',
        })
        .where(
            isMovingUp
                ? 'animal_id = :animalId AND ABS(display_order) > :currentOrder AND ABS(display_order) <= :newOrder'
                : 'animal_id = :animalId AND ABS(display_order) >= :newOrder AND ABS(display_order) < :currentOrder',
            {
                animalId,
                currentOrder,
                newOrder,
            },
        )
        .execute();

    await animalImageRepository.updateByIdPartially(imageId, {
        display_order: newOrder,
    });
};
