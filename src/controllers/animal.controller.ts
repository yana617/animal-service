import { type Request, type Response } from 'express';
import { ILike, In } from 'typeorm';

import { animalRepository } from '../repositories/animal.repository';
import { Status } from '../database/models/animal';
import { generateDateBetweenQuery } from '../utils/generate-date-between-query';
import { GetAnimalQuery } from './types';
import { shuffleRandomSort } from '../utils/shuffle-random-sort';

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
    } = req.query as GetAnimalQuery;

    const statusQuery =
        (status?.includes(',') ? In(status.split(',')) : status) ||
        Status.HOMELESS;

    const animals = await animalRepository.getAll({
        where: {
            type,
            sex,
            status: statusQuery,
            place,
            birthday: generateDateBetweenQuery(birthday_from, birthday_to),
            ...(search ? { name: ILike(`%${search}%`) } : {}),
        },
        ...(sortBy
            ? {
                  order: {
                      [sortBy]: order || 'ASC',
                  },
              }
            : {}),
    });

    const mappedAnimals = animals.map((animal) => ({ ...animal, photos: [] }));

    res.json({
        success: true,
        data: sortBy ? mappedAnimals : shuffleRandomSort(mappedAnimals),
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
    createAnimal,
};
