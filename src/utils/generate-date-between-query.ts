import { Between, type FindOperator } from 'typeorm';

export const generateDateBetweenQuery = (
    from?: string,
    to?: string,
): FindOperator<Date> => {
    const fromDate = from ? new Date(from) : new Date(+0);
    const toDate = to ? new Date(to) : new Date('2100-01-01');
    return Between(fromDate, toDate);
};
