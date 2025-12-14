import { type Ad } from '../../database/models/ad';

export type WeeklyAdStats = {
    week: string;
    start_date: string;
    end_date: string;
    count: number;
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
            start_date: weekStart.toISOString().split('T')[0],
            end_date: weekEnd.toISOString().split('T')[0],
            count: 0,
        });
    }

    ads.forEach((ad) => {
        const adDateTime = new Date(ad.date).getTime();

        const weekStat = weeklyStats.find((stat) => {
            const start = new Date(stat.start_date).getTime();
            const end = new Date(stat.end_date).getTime();
            return adDateTime >= start && adDateTime <= end;
        });

        if (weekStat) {
            weekStat.count++;
        }
    });

    return weeklyStats;
};
