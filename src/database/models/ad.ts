import { type Animal } from './animal';
import { type Platform } from './platform';

export type Ad = {
    id: string;
    user_id: string;
    date: Date;

    animal_id?: string;
    animal: Animal;

    platform_id?: string;
    platform: Platform;
};
