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
    order?: 'asc' | 'desc';
    sortBy?: keyof Animal;
    search?: string;
    height_from?: number;
    height_to?: number;
    sterilized?: boolean;
    room?: number;
};
