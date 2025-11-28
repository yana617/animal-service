import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { type Ad as AdModel } from '../models/ad';
import { Animal } from './animal.entity';
import { Platform } from './platform.entity';

@Entity('ad')
export class Ad implements AdModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    user_id: string;

    @Column({ type: 'date' })
    date: Date;

    @ManyToOne(() => Animal, (animal) => animal.ads)
    @JoinColumn({ name: 'animal_id' })
    animal: Animal;

    @ManyToOne(() => Platform, (platform) => platform.ads)
    @JoinColumn({ name: 'platform_id' })
    platform: Platform;
}
