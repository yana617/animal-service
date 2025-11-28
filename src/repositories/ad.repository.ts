import { type Repository } from 'typeorm';

import { BaseRepository } from './base.repository';
import { AppDataSource } from '../database';
import { Ad } from '../database/entities/ad.entity';

class AdRepository extends BaseRepository<Ad> {
    repository: Repository<Ad>;

    constructor(repository: Repository<Ad>) {
        super(repository);
        this.repository = repository;
    }
}

export const adRepository = new AdRepository(AppDataSource.getRepository(Ad));
