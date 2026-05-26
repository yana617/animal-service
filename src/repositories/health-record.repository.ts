import { type Repository } from 'typeorm';

import { BaseRepository } from './base.repository';
import { AppDataSource } from '../database';
import { HealthRecord } from '../database/entities/health-record.entity';
import { HealthRecordType } from '../database/models/health-record';
import { type AnimalType, type Status } from '../database/models/animal';

class HealthRecordRepository extends BaseRepository<HealthRecord> {
    repository: Repository<HealthRecord>;

    constructor(repository: Repository<HealthRecord>) {
        super(repository);
        this.repository = repository;
    }

    async getByAnimalId(
        animalId: string,
        type?: HealthRecordType,
    ): Promise<HealthRecord[]> {
        const qb = this.repository
            .createQueryBuilder('record')
            .where('record.animal_id = :animalId', { animalId })
            .orderBy('record.date', 'DESC');

        if (type) {
            qb.andWhere('record.type = :type', { type });
        }

        return await qb.getMany();
    }

    async deleteByAnimalId(animalId: string): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .delete()
            .where('animal_id = :animalId', { animalId })
            .execute();
    }

    async getVaccinationsByAnimalTypesAndStatuses(
        animalTypes: AnimalType[],
        statuses: Status[],
    ): Promise<HealthRecord[]> {
        return await this.repository
            .createQueryBuilder('record')
            .innerJoinAndSelect('record.animal', 'animal')
            .where('record.type = :type', { type: HealthRecordType.VACCINE })
            .andWhere('animal.type IN (:...animalTypes)', { animalTypes })
            .andWhere('animal.status IN (:...statuses)', { statuses })
            .orderBy('animal.name', 'ASC')
            .addOrderBy('record.date', 'DESC')
            .getMany();
    }
}

export const healthRecordRepository = new HealthRecordRepository(
    AppDataSource.getRepository(HealthRecord),
);
