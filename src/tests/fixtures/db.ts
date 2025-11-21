import { v4 } from 'uuid';
import faker from 'faker';

import {
    type Animal,
    AnimalType,
    Place,
    Sex,
    Status,
} from '../../database/models/animal';
import type { AnimalImage } from '../../database/models/animal-image';
import { type Platform } from '../../database/models/platform';

export const generateAnimal = (options: Partial<Animal> = {}): Animal => ({
    id: options.id || v4(),
    name: options.name || faker.lorem.words(1),
    room: options.room || faker.datatype.number({ min: 1, max: 7 }),
    description: faker.lorem.words(15),
    advertising_text: faker.lorem.words(15),
    type: options.type || AnimalType.DOG,
    place: options.place || Place.MAIN_HOUSE,
    birthday: options.birthday || faker.date.past(),
    second_birthday: faker.date.past(),
    sex: options.sex || faker.random.arrayElement([Sex.MALE, Sex.FEMALE]),
    status: options.status || Status.HOMELESS,
    sterilized: options.sterilized || faker.datatype.boolean(),
    photos: options.photos || [],
    height: options.height || faker.datatype.number({ min: 20, max: 80 }),
    taken_home_date: options.taken_home_date || undefined,
});

export const generateAnimalImage = (
    animal: Animal,
    options: Partial<AnimalImage> = {},
): AnimalImage => ({
    id: options.id || v4(),
    animal,
    image_key: `${animal.id}/${v4()}.png`,
    display_order: options.display_order || 1,
});

export const generatePlatform = (
    options: Partial<Platform> = {},
): Platform => ({
    id: options.id || v4(),
    name: options.name || faker.lorem.words(1),
});
