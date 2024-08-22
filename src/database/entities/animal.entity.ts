import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import {
  IsInt,
  IsDate,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

import {
  type Animal as AnimalModel,
  AnimalType,
  Place,
  Sex,
  Status,
} from '../models/animal';

@Entity()
export class Animal implements AnimalModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: AnimalType,
  })
  type: AnimalType;

  @Column({
    type: 'enum',
    enum: Place,
  })
  place: Place;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  room?: number;

  @Column()
  @IsDate()
  birthday: Date;

  @Column({
    type: 'enum',
    enum: Sex,
  })
  sex: Sex;

  @Column({ nullable: true })
  description?: string;

  @Column()
  @IsDate()
  second_birthday: Date;

  @Column({
    type: 'enum',
    enum: Status,
  })
  status: Status;

  @Column({ nullable: true })
  advertising_text?: string;

  @Column({ nullable: true })
  @IsInt()
  @Min(10)
  @Max(70)
  height?: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  sterilized: boolean;

  @Column({ nullable: true })
  @IsDate()
  taken_home_date?: Date;

  @Column({ nullable: true })
  curator_id?: string; // user_id

  @Column({ nullable: true })
  health_details?: string;
}
