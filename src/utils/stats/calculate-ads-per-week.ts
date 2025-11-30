import { type Ad } from '../../database/models/ad';

export type WeeklyAdStats = {
    week: string;
    week_short: string;
    start_date: string;
    end_date: string;
    count: number;
};

export const calculateWeeklyStats = (
    ads: Ad[],
    endDate: Date,
): WeeklyAdStats[] => {
    const weeklyStats: WeeklyAdStats[] = [];

    for (let i = 12; i >= 0; i--) {
        const weekEnd = new Date(endDate);
        weekEnd.setDate(endDate.getDate() - i * 7);

        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);

        const year = weekStart.getFullYear();
        const weekNumber = getWeekNumber(weekStart);
        const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
        const weekShort = `${weekNumber}/${year.toString().slice(2)}`; // "40/24"

        weeklyStats.push({
            week: weekKey,
            week_short: weekShort,
            start_date: weekStart.toISOString().split('T')[0],
            end_date: weekEnd.toISOString().split('T')[0],
            count: 0,
        });
    }

    ads.forEach((ad) => {
        const adDate = new Date(ad.date);
        const year = adDate.getFullYear();
        const weekNumber = getWeekNumber(adDate);
        const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

        const weekStat = weeklyStats.find((stat) => stat.week === weekKey);
        if (weekStat) {
            weekStat.count++;
        }
    });

    return weeklyStats;
};

const getWeekNumber = (date: Date): number => {
    const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};
