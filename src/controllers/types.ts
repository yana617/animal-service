import { type Request } from 'express';
import {
    type Animal,
    type AnimalType,
    type Place,
    type Sex,
    type Status,
} from '../database/models/animal';

export type GetAnimalsQuery = {
    type?: AnimalType;
    sex?: Sex;
    status?: Status;
    place?: Place;
    birthday_from?: string;
    birthday_to?: string;
    order?: 'ASC' | 'DESC';
    sortBy?: keyof Animal;
    search?: string;
    height_from?: number;
    height_to?: number;
    sterilized?: boolean;
    room?: number;
    limit?: string;
    skip?: string;
};

export type UpdateOrderRequestBody = {
    display_order: number;
};

export type ImageRequestParams = {
    id: string;
    imageId: string;
};

export type FileType = Express.Multer.File & { key: string };

export type RequestWithAnimal<T, T2> = Request<T, T2> & { animal: Animal };
