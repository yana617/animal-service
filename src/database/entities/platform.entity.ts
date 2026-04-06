import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { type Platform as PlatformModel } from '../models/platform';
import { Ad } from './ad.entity';

@Entity()
export class Platform implements PlatformModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @OneToMany(() => Ad, (ad) => ad.platform)
    ads: Ad[];
}
