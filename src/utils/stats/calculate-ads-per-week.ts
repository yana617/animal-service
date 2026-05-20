import { type Ad } from '../../database/models/ad';

export type WeeklyAdStats = {
    week: string;
    start_date: string;
    end_date: string;
    count: number;
};

const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const calculateWeeklyStats = (
    ads: Ad[],
    endDate: Date,
): WeeklyAdStats[] => {
    const weeklyStats: WeeklyAdStats[] = [];

    for (let i = 11; i >= 0; i--) {
        const weekEnd = new Date(endDate);
        weekEnd.setDate(endDate.getDate() - i * 7);

        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);

        const dayStart =
            weekStart.getDate() > 9
                ? weekStart.getDate()
                : `0${weekStart.getDate()}`;

        const dayEnd =
            weekEnd.getDate() > 9 ? weekEnd.getDate() : `0${weekEnd.getDate()}`;

        const monthStart =
            weekStart.getMonth() > 8
                ? weekStart.getMonth() + 1
                : `0${weekStart.getMonth() + 1}`;
        const monthEnd =
            weekEnd.getMonth() > 8
                ? weekEnd.getMonth() + 1
                : `0${weekEnd.getMonth() + 1}`;
        const weekKey = `${dayStart}.${monthStart}-${dayEnd}.${monthEnd}`;

        weeklyStats.push({
            week: weekKey,
            start_date: toLocalDateString(weekStart),
            end_date: toLocalDateString(weekEnd),
            count: 0,
        });
    }

    ads.forEach((ad) => {
        const adDateString =
            typeof ad.date === 'string'
                ? (ad.date as string).slice(0, 10)
                : toLocalDateString(new Date(ad.date));

        const weekStat = weeklyStats.find(
            (stat) =>
                adDateString >= stat.start_date &&
                adDateString <= stat.end_date,
        );

        if (weekStat) {
            weekStat.count++;
        }
    });

    return weeklyStats;
};
