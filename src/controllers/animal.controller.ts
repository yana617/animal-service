import { type Request, type Response } from 'express';
import { Between, ILike, In } from 'typeorm';

import { animalRepository } from '../repositories/animal.repository';
import { AnimalType, Status } from '../database/models/animal';
import { generateDateBetweenQuery } from '../utils/generate-date-between-query';
import { type GetAnimalsQuery } from './types';
import { shuffleRandomSort } from '../utils/shuffle-random-sort';
import { ERRORS } from '../translates';

const RANDOM_IMAGE =
    'https://sun9-33.userapi.com/impg/sFaWNeHsokebqhegXFfLipAz3magquywvlU6pw/G6OOJxOufu8.jpg?size=810x1080&quality=95&sign=8271b8e8210ff74dbb9fe827e7f11700&type=album';

const getAll = async (req: Request, res: Response): Promise<void> => {
    const {
        type,
        sex,
        status,
        place,
        birthday_from,
        birthday_to,
        order,
        sortBy,
        search,
        height_from,
        height_to,
        sterilized,
        room,
    } = req.query as GetAnimalsQuery;

    const statusQuery = (status?.includes(',') ? In(status.split(',')) : status) || Status.HOMELESS;

    const animals = await animalRepository.getAll({
        where: {
            type,
            sex,
            status: statusQuery,
            place,
            sterilized,
            room,
            birthday: generateDateBetweenQuery(birthday_from, birthday_to),
            ...(type === AnimalType.DOG
                ? { height: Between(height_from || 0, height_to || 100) }
                : {}),
            ...(search ? { name: ILike(`%${search}%`) } : {}),
        },
        ...(sortBy
            ? {
                  order: {
                      [sortBy]: order || 'asc',
                  },
              }
            : {}),
    });

    const mappedAnimals = animals.map((animal) => ({
        ...animal,
        photos: [RANDOM_IMAGE],
    })); // TODO: fix after S3 integrated

    res.json({
        success: true,
        data: sortBy ? mappedAnimals : shuffleRandomSort(mappedAnimals),
    });
};

const getAnimal = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    const animal = await animalRepository.getById(id);

    if (!animal) {
        return res
            .status(404)
            .json({ success: false, error: ERRORS.ANIMAL_NOT_FOUND });
    }

    res.json({
        success: true,
        data: { ...animal, photos: [RANDOM_IMAGE] }, // TODO: fix after S3 integrated
    });
};

// TO-DO: finish
const createAnimal = async (req: Request, res: Response): Promise<void> => {
    await animalRepository.create(req.body);

    res.json({
        success: true,
    });
};

export const animalController = {
    getAll,
    getAnimal,
    createAnimal,
};
