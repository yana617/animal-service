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

    async getUpcomingVaccinations(statuses: Status[]): Promise<HealthRecord[]> {
        const now = new Date();
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const monthAfterNextStart = new Date(
            now.getFullYear(),
            now.getMonth() + 2,
            1,
        );

        return await this.repository
            .createQueryBuilder('record')
            .innerJoinAndSelect('record.animal', 'animal')
            .where('record.type = :type', { type: HealthRecordType.VACCINE })
            .andWhere('record.next_due_date IS NOT NULL')
            .andWhere('animal.status IN (:...statuses)', { statuses })
            .andWhere('record.next_due_date >= :nextMonthStart', {
                nextMonthStart,
            })
            .andWhere('record.next_due_date < :monthAfterNextStart', {
                monthAfterNextStart,
            })
            // Keep only the latest vaccination record per animal so that an
            // older record with a due date in the target month does not match
            // an animal that has since been re-vaccinated.
            .andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('MAX(latest.date)')
                    .from(HealthRecord, 'latest')
                    .where('latest.animal_id = record.animal_id')
                    .andWhere('latest.type = :type')
                    .getQuery();
                return `record.date = ${subQuery}`;
            })
            .orderBy('record.next_due_date', 'ASC')
            .getMany();
    }
}

export const healthRecordRepository = new HealthRecordRepository(
    AppDataSource.getRepository(HealthRecord),
);
