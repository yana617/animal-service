import type { Animal } from './animal';

export type AnimalImage = {
    id: string;
    image_key: string;
    display_order: number;
    animal_id?: string;
    animal: Animal;
};
