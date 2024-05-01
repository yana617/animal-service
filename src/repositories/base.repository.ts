import { type ObjectLiteral, type Repository } from 'typeorm';

export class BaseRepository<T extends ObjectLiteral> {
  repository: Repository<T>;

  constructor(repository) {
    this.repository = repository;
  }

  async getAll(): Promise<T[]> {
    return await this.repository.find();
  }

  async getById(id): Promise<T | null> {
    return await this.repository.findOneBy({ id });
  }

  async create(data: T): Promise<T> {
    return this.repository.create(data);
  }

  async updateById(id: string, data): Promise<void> {
    await this.repository.save({
      id,
      ...data,
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
