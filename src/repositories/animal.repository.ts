import { type Repository } from 'typeorm';

import { BaseRepository } from './base.repository';
import { AppDataSource } from '../database';
import { Animal } from '../database/entities/animal.entity';
import { Status } from '../database/models/animal';

class AnimalRepository extends BaseRepository<Animal> {
    repository: Repository<Animal>;

    constructor(repository: Repository<Animal>) {
        super(repository);
        this.repository = repository;
    }

    async findAds(): Promise<any[]> {
        return await this.createQueryBuilder('animal')
            .leftJoinAndSelect('animal.ads', 'ad')
            .leftJoinAndSelect('ad.platform', 'platform')
            .select([
                'animal.id as animal_id',
                'animal.name as animal_name',
                'platform.id as platform_id',
                'MAX(ad.date) as last_ad_date',
            ])
            .where('animal.status = :status', { status: Status.HOMELESS })
            .groupBy('animal.id, animal.name, platform.id')
            .getRawMany();
    }
}

export const animalRepository = new AnimalRepository(
    AppDataSource.getRepository(Animal),
);
