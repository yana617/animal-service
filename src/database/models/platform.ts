import { type Ad } from './ad';

export type Platform = {
    id: string;
    name: string;
    ads: Ad[];
};
