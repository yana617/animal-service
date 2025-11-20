import {
    type SelectQueryBuilder,
    type DeepPartial,
    type FindManyOptions,
    type ObjectLiteral,
    type Repository,
    type FindOneOptions,
} from 'typeorm';

export class BaseRepository<T extends ObjectLiteral> {
    repository: Repository<T>;

    constructor(repository) {
        this.repository = repository;
    }

    async getAllWithCount(
        params: FindManyOptions<T> | undefined,
    ): Promise<[T[], number]> {
        return await this.repository.findAndCount(params);
    }

    async getAll(params?: FindManyOptions<T> | undefined): Promise<T[]> {
        return await this.repository.find(params);
    }

    async getById(id, relations?: string[]): Promise<T | null> {
        return await this.repository.findOne({ where: { id }, relations });
    }

    async findOne(params: FindOneOptions<T>): Promise<T | null> {
        return await this.repository.findOne(params);
    }

    async create(data: Omit<T, 'id'>): Promise<T> {
        return await this.repository.save(data as T);
    }

    async updateById(id: string, data: DeepPartial<T>): Promise<void> {
        await this.repository.save({
            ...data,
            id,
        });
    }

    async updateByIdPartially(id: string, data: Partial<T>): Promise<void> {
        await this.repository.update(id, data);
    }

    async deleteById(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async deleteAll(): Promise<void> {
        await this.repository.delete({});
    }

    createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
        return this.repository.createQueryBuilder(alias);
    }

    async remove(entity: T): Promise<void> {
        await this.repository.remove(entity);
    }
}
