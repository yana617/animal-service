import { type Repository } from 'typeorm';

import { BaseRepository } from './base.repository';
import { AppDataSource } from '../database';
import { Platform } from '../database/entities/platform.entity';

class PlatformRepository extends BaseRepository<Platform> {
    repository: Repository<Platform>;

    constructor(repository: Repository<Platform>) {
        super(repository);
        this.repository = repository;
    }
}

export const platformRepository = new PlatformRepository(
    AppDataSource.getRepository(Platform),
);
