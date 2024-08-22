export enum Place {
    MAIN_HOUSE = 'main-house',
    CAT_HOUSE = 'cat-house',
    QUARANTINE_HOUSE = 'quarantine-house',
    AVIARY = 'aviary',
    ON_TEMPORARY_HOLD = 'on-temporary-hold',
}

export enum AnimalType {
    CAT = 'cat',
    DOG = 'dog',
    OTHER = 'other',
}

export enum Sex {
    MALE = 'male',
    FEMALE = 'female',
}

export enum Status {
    HOMELESS = 'homeless',
    ADOPTED = 'adopted',
    PREPARATION = 'preparation',
    DIED = 'died',
    LOST = 'lost',
}

export type Animal = {
    id: string;
    name: string;
    type: AnimalType;
    place: Place;
    room?: number;
    birthday: Date;
    sex: Sex;
    curator_id?: string;
    description?: string;
    second_birthday: Date;
    status: Status;
    advertising_text?: string;
    height?: number; // required for dogs only
    sterilized: boolean;
    taken_home_date?: Date;
    health_details?: string;
};
