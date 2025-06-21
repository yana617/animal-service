import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Unique,
    JoinColumn,
} from 'typeorm';

import { type AnimalImage as AnimalImageModel } from '../models/animal-image';
import { Animal } from './animal.entity';

@Entity()
@Unique(['animal', 'display_order'])
export class AnimalImage implements AnimalImageModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Animal, (animal) => animal.photos)
    @JoinColumn({ name: 'animal_id' })
    animal: Animal;

    @Column()
    image_key: string;

    @Column({ default: 1 })
    display_order: number;
}
