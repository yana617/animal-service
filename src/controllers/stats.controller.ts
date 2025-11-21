import { type Request, type Response } from 'express';

import { animalRepository } from '../repositories/animal.repository';
import { Status } from '../database/models/animal';
import { calculateAgeInYears } from '../utils/calculate-age-in-years';
import { generateAgeGroups } from '../utils/stats/generate-age-groups';
import { formatMonthlyResultsLast12Months } from '../utils/stats/format-monthly-results-last-12-months';

const getAnimalsPerAge = async (req: Request, res: Response): Promise<void> => {
    const homelessAnimals = await animalRepository.getAll({
        where: { status: Status.HOMELESS },
    });

    const agesInYears = homelessAnimals.map((animal) =>
        calculateAgeInYears(animal.birthday),
    );

    const maxAge = Math.max(...agesInYears);
    const neededAgeGroups = generateAgeGroups(maxAge);

    const result = neededAgeGroups.map((group) => ({
        age: group.label,
        count: agesInYears.filter((age) =>
            group.minYears === 0
                ? age < 1
                : age >= group.minYears && age <= group.maxYears,
        ).length,
    }));

    res.json({
        success: true,
        data: result,
    });
};

const getAdoptedAnimalsPerMonth = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const today = new Date();

    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    const animalsCountPerMonth = await animalRepository
        .createQueryBuilder('animal')
        .select("TO_CHAR(animal.taken_home_date, 'YYYY-MM')", 'month_key')
        .addSelect('COUNT(animal.id)', 'count')
        .where('animal.status = :status', { status: Status.ADOPTED })
        .andWhere('animal.taken_home_date IS NOT NULL')
        .andWhere('animal.taken_home_date BETWEEN :start AND :end', {
            start: startDate,
            end: endDate,
        })
        .groupBy("TO_CHAR(animal.taken_home_date, 'YYYY-MM')")
        .orderBy('month_key', 'ASC')
        .getRawMany();

    const result = formatMonthlyResultsLast12Months(
        animalsCountPerMonth,
        startDate,
    );

    res.json({
        success: true,
        data: result,
    });
};

export const statsController = {
    getAnimalsPerAge,
    getAdoptedAnimalsPerMonth,
};
