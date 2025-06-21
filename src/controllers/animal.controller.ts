/* eslint-disable @typescript-eslint/ban-types */
import { type Request, type Response } from 'express';

import { animalRepository } from '../repositories/animal.repository';
import { type Animal, AnimalType, Status } from '../database/models/animal';
import { type RequestWithAnimal, type GetAnimalsQuery } from './types';
import { shuffleRandomSort } from '../utils/shuffle-random-sort';
import { ERRORS } from '../translates';
import { animalImageRepository } from '../repositories/animal-image.repository';

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

    const query = animalRepository
        .createQueryBuilder('animal')
        .leftJoinAndMapOne(
            'animal.photo',
            'animal.photos',
            'photo',
            'photo.display_order = :displayOrder',
            {
                displayOrder: 1,
            },
        );

    // Add filtering conditions

    if (status?.includes(',')) {
        const statuses = status.split(',') as Status[];
        query.andWhere('animal.status IN (:...statuses)', { statuses });
    } else {
        query.andWhere('animal.status = :status', {
            status: status || Status.HOMELESS,
        });
    }

    if (type) {
        query.andWhere('animal.type = :type', { type });
    }

    if (sex) {
        query.andWhere('animal.sex = :sex', { sex });
    }

    if (place) {
        query.andWhere('animal.place = :place', { place });
    }

    if (typeof sterilized === 'boolean') {
        query.andWhere('animal.sterilized = :sterilized', { sterilized });
    }

    if (room) {
        query.andWhere('animal.room = :room', { room });
    }

    if (birthday_from || birthday_to) {
        query.andWhere(
            'animal.birthday BETWEEN :birthdayFrom AND :birthdayTo',
            {
                birthdayFrom: birthday_from || '1900-01-01',
                birthdayTo: birthday_to || '2100-12-31',
            },
        );
    }

    if (type === AnimalType.DOG) {
        query.andWhere('animal.height BETWEEN :heightFrom AND :heightTo', {
            heightFrom: height_from || 0,
            heightTo: height_to || 100,
        });
    }

    if (search) {
        query.andWhere('animal.name ILIKE :search', { search: `%${search}%` });
    }

    if (sortBy) {
        query.orderBy(`animal.${sortBy}`, order || 'ASC');
    }

    if (typeof skip === 'string' && typeof limit === 'string') {
        query.skip(parseInt(skip)).take(parseInt(limit));
    }

    const [animals, total] = await query.getManyAndCount();

    const mappedAnimals = (animals as Animal[]).map((animal) => ({
        ...animal,
        photo: animal.photo
            ? `${process.env.AWS_BUCKET_URL}/${animal.photo.image_key}`
            : null,
    }));

    res.json({
        success: true,
        data: {
            animals: sortBy ? mappedAnimals : shuffleRandomSort(mappedAnimals),
            total,
        },
    });
};

const getAllShort = async (_, res: Response): Promise<void> => {
    const [animals, total] = await animalRepository
        .createQueryBuilder('animal')
        .leftJoinAndMapOne(
            'animal.photo',
            'animal.photos',
            'photo',
            'photo.display_order = :displayOrder',
            { displayOrder: 1 },
        )
        .select(['animal.id', 'animal.name', 'photo'])
        .where('animal.status = :status', { status: Status.HOMELESS })
        .orderBy('animal.name', 'ASC')
        .getManyAndCount();

    res.json({
        success: true,
        data: {
            animals: (animals as Animal[]).map((animal) => ({
                ...animal,
                photo: animal.photo
                    ? `${process.env.AWS_BUCKET_URL}/${animal.photo.image_key}`
                    : null,
            })),
            total,
        },
    });
};

const getAnimal = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    const animalWithPhotos = await animalRepository
        .createQueryBuilder('animal')
        .leftJoinAndSelect('animal.photos', 'photo')
        .where('animal.id = :id', { id })
        .orderBy('photo.display_order', 'ASC')
        .getOne();

    res.json({
        success: true,
        data: {
            ...animalWithPhotos,
            photos: animalWithPhotos?.photos.map((photo) => ({
                id: photo.id,
                url: `${process.env.AWS_BUCKET_URL}/${photo.image_key}`,
            })),
        },
    });
};

const createAnimal = async (
    req: Request<{}, {}, Animal>,
    res: Response,
): Promise<any> => {
    const {
        name,
        type,
        place,
        room,
        birthday,
        sex,
        curator_id,
        description,
        second_birthday,
        status,
        advertising_text,
        height,
        sterilized,
        taken_home_date,
        health_details,
    } = req.body;

    if (type === AnimalType.DOG && !height) {
        return res
            .status(400)
            .json({ success: false, error: ERRORS.DOG_HEIGHT_REQUIRED });
    }

    const animal = await animalRepository.create({
        name,
        type,
        place,
        room,
        birthday,
        sex,
        curator_id,
        description,
        second_birthday,
        status,
        advertising_text,
        height: type === AnimalType.DOG ? height : undefined,
        sterilized,
        taken_home_date,
        health_details,
        photos: [],
    });

    res.json({
        success: true,
        data: animal,
    });
};

const updateAnimal = async (
    req: Request<{ id: string }, Omit<Animal, 'id'>>,
    res: Response,
): Promise<any> => {
    const { id } = req.params;
    const {
        name,
        type,
        place,
        room,
        birthday,
        sex,
        curator_id,
        description,
        second_birthday,
        status,
        advertising_text,
        height,
        sterilized,
        taken_home_date,
        health_details,
    } = req.body;

    if (type === AnimalType.DOG && !height) {
        return res
            .status(400)
            .json({ success: false, error: ERRORS.DOG_HEIGHT_REQUIRED });
    }

    await animalRepository.updateById(id, {
        name,
        type,
        place,
        room,
        birthday,
        sex,
        curator_id,
        description,
        second_birthday,
        status,
        advertising_text,
        height: type === AnimalType.DOG ? height : undefined,
        sterilized,
        taken_home_date,
        health_details,
        photos: [],
    });

    res.json({
        success: true,
    });
};

const deleteAnimal = async (
    req: RequestWithAnimal<{ id: string }, {}>,
    res: Response,
): Promise<any> => {
    const { id } = req.params;

    await animalImageRepository.deleteByAnimal(req.animal);
    await animalRepository.deleteById(id);

    res.json({
        success: true,
    });
};

export const animalController = {
    getAll,
    getAnimal,
    createAnimal,
    updateAnimal,
    getAllShort,
    deleteAnimal,
};
