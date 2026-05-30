import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';

import {
    type HealthRecord as HealthRecordModel,
    type HealthRecordFile,
    HealthRecordType,
} from '../models/health-record';
import { Animal } from './animal.entity';

@Entity('health_record')
export class HealthRecord implements HealthRecordModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({
        type: 'enum',
        enum: HealthRecordType,
    })
    type: HealthRecordType;

    @Column({ type: 'date' })
    date: Date;

    @Column({ name: 'drug_name', nullable: true })
    drug_name?: string;

    @Index()
    @Column({ name: 'next_due_date', type: 'date', nullable: true })
    next_due_date?: Date;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ type: 'jsonb', nullable: true })
    files?: HealthRecordFile[];

    @Index()
    @ManyToOne(() => Animal, (animal) => animal.health_records, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'animal_id' })
    animal: Animal;
}
