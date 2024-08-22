/* eslint-disable @typescript-eslint/ban-types */
import { type Request, type Response } from 'express';
import { Between, ILike, In } from 'typeorm';

import { animalRepository } from '../repositories/animal.repository';
import { AnimalType, Status } from '../database/models/animal';
import { generateDateBetweenQuery } from '../utils/generate-date-between-query';
import { type GetAnimalsQuery } from './types';
import { shuffleRandomSort } from '../utils/shuffle-random-sort';
import { ERRORS } from '../translates';

const RANDOM_IMAGE =
    'https://sun9-36.userapi.com/impg/E4Il7RvJNFk9uHeH3Td4thfz_hD9QxK88o7w9Q/AugBQ_jTpRg.jpg?size=1600x1068&quality=95&sign=f650a5a6635b025ef45aee9caf623807&type=album';

const getAll = async (
    req: Request<{}, {}, {}, GetAnimalsQuery>,
    res: Response,
): Promise<void> => {
    const {
        type,
        sex,
        status,
        place,
        birthday_from,
        birthday_to,
        search,
        height_from,
        height_to,
        sterilized,
        room,
        order,
        sortBy,
        limit,
        skip = 0,
    } = req.query;

    const statusQuery =
        (status?.includes(',') ? In(status.split(',')) : status) ||
        Status.HOMELESS;

    // const a = await animalRepository.getAll({});
    // console.log('count', a.length);

    const [animals, total] = await animalRepository.getAllWithCount({
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
        ...(typeof skip === 'string' && typeof limit === 'string'
            ? { take: parseInt(limit), skip: parseInt(skip) }
            : {}),
    });

    console.log('request res', animals.length, sortBy, order);

    const mappedAnimals = animals.map((animal) => ({
        ...animal,
        photos: [RANDOM_IMAGE],
    })); // TODO: fix after S3 integrated

    res.json({
        success: true,
        data: {
            animals: sortBy ? mappedAnimals : shuffleRandomSort(mappedAnimals),
            total,
        },
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
