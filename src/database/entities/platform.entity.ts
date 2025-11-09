import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { type Platform as PlatformModel } from '../models/platform';

@Entity()
export class Platform implements PlatformModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;
}
