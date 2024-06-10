import {
    Animal,
    AnimalType,
    Place,
    Sex,
    Status,
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
};
