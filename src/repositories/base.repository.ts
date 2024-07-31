import { type FindManyOptions, type ObjectLiteral, type Repository } from 'typeorm';

export class BaseRepository<T extends ObjectLiteral> {
    repository: Repository<T>;

    constructor(repository) {
        this.repository = repository;
    }

    async getAll(params: FindManyOptions<T> | undefined): Promise<T[]> {
        return await this.repository.find(params);
    }

    async getById(id): Promise<T | null> {
        return await this.repository.findOneBy({ id });
    }

    async create(data: T): Promise<T> {
        return await this.repository.save(data);
    }

    async updateById(id: string, data): Promise<void> {
        await this.repository.save({
            ...data,
            id,
        });
    }

    async deleteById(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async deleteAll(): Promise<void> {
        await this.repository.clear();
    }
}
