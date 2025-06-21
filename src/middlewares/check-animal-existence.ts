import { animalRepository } from '../repositories/animal.repository';
import { ERRORS } from '../translates';

export const checkAnimalExistence = async (req, res, next): Promise<any> => {
    const { id } = req.params;
    const animal = await animalRepository.getById(id);

    if (!animal) {
        res.status(404).json({
            success: false,
            error: ERRORS.ANIMAL_NOT_FOUND,
        });
        return;
    }

    req.animal = animal;

    next();
};
