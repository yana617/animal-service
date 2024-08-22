import { type Repository } from 'typeorm';

import { BaseRepository } from './base.repository';
import { AppDataSource } from '../database';
import { Animal } from '../database/entities/animal.entity';

class AnimalRepository extends BaseRepository<Animal> {
  repository: Repository<Animal>;

  constructor(repository: Repository<Animal>) {
    super(repository);
    this.repository = repository;
  }
}

export const animalRepository = new AnimalRepository(AppDataSource.getRepository(Animal));
