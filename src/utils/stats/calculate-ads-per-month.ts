import { type Ad } from '../../database/models/ad';

export type MonthlyAdStats = {
    month: string;
    month_short: string;
    start_date: string;
    end_date: string;
    count: number;
};

export const calculateMonthlyStats = (
    ads: Ad[],
    endDate: Date,
): MonthlyAdStats[] => {
    const monthlyStats: MonthlyAdStats[] = [];

    for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(endDate);
        monthStart.setMonth(endDate.getMonth() - i);
        monthStart.setDate(1);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);

        const year = monthStart.getFullYear();
        const month = monthStart.getMonth() + 1;
        const period = `${year}-${month.toString().padStart(2, '0')}`;
        const periodShort = `${monthStart.toLocaleString('default', {
            month: 'short',
        })} '${year.toString().slice(2)}`;

        monthlyStats.push({
            month: period,
            month_short: periodShort,
            start_date: monthStart.toISOString().split('T')[0],
            end_date: monthEnd.toISOString().split('T')[0],
            count: 0,
        });
    }

    ads.forEach((ad) => {
        const adDate = new Date(ad.date);
        const year = adDate.getFullYear();
        const month = adDate.getMonth() + 1;
        const period = `${year}-${month.toString().padStart(2, '0')}`;

        const monthStat = monthlyStats.find((stat) => stat.month === period);
        if (monthStat) {
            monthStat.count++;
        }
    });

    return monthlyStats;
};
