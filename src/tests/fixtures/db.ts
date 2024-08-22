import { v4 } from 'uuid';
import faker from 'faker';

import {
    type Animal,
    AnimalType,
    Place,
    Sex,
    Status,
} from '../../database/models/animal';

export const generateAnimal = (options: Partial<Animal> = {}): Animal => ({
    id: options.id || v4(),
    name: options.name || faker.lorem.words(1),
    description: faker.lorem.words(15),
    type:
        options.type ||
        faker.random.arrayElement([AnimalType.DOG, AnimalType.CAT]),
    place: options.place || Place.MAIN_HOUSE,
    birthday: options.birthday || faker.date.past(),
    second_birthday: faker.date.past(),
    sex: options.sex || faker.random.arrayElement([Sex.MALE, Sex.FEMALE]),
    status: options.status || Status.HOMELESS,
    sterilized: options.sterilized || faker.datatype.boolean,
    height:
        options.height ||
        (options.type === AnimalType.DOG
            ? faker.datatype.number({ min: 20, max: 80 })
            : null),
});
