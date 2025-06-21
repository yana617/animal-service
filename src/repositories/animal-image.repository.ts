import { type DeleteResult, type Repository } from 'typeorm';

import { BaseRepository } from './base.repository';
import { AppDataSource } from '../database';
import { AnimalImage } from '../database/entities/animal-image.entity';
import type { Animal } from '../database/models/animal';

class AnimalImageRepository extends BaseRepository<AnimalImage> {
    repository: Repository<AnimalImage>;

    constructor(repository: Repository<AnimalImage>) {
        super(repository);
        this.repository = repository;
    }

    async getImagesByAnimal(animal: Animal): Promise<AnimalImage[]> {
        return await this.repository.find({ where: { animal } });
    }

    async deleteByAnimal(animal: Animal): Promise<DeleteResult> {
        return await this.repository.delete({ animal });
    }
}

export const animalImageRepository = new AnimalImageRepository(
    AppDataSource.getRepository(AnimalImage),
);
