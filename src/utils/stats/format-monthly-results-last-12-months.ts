type Stat = { month: string; count: number };

export const monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
];

export const formatMonthlyResultsLast12Months = (
    rawResults: any[],
    startDate: Date,
): Stat[] => {
    const resultMap = new Map();

    rawResults.forEach((item) => {
        resultMap.set(item.month_key, parseInt(item.count));
    });

    const monthlyData: Stat[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 12; i++) {
        const year = current.getFullYear();
        const month = current.getMonth();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;

        const monthName = `${monthNames[month]} ${year}`;
        const count = resultMap.get(key) || 0;

        monthlyData.push({
            month: monthName,
            count,
        });

        current.setMonth(current.getMonth() + 1);
    }

    return monthlyData;
};
