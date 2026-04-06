type Group = { label: string; minYears: number; maxYears: number };

export const generateAgeGroups = (maxAge: number): Group[] => {
    const groups: Group[] = [];

    groups.push({ label: 'меньше 1 года', minYears: 0, maxYears: 0.99 });

    for (let year = 1; year <= Math.min(maxAge, 20); year++) {
        let label: string;

        if (year === 1) {
            label = '1 год';
        } else if (year >= 2 && year <= 4) {
            label = `${year} года`;
        } else {
            label = `${year} лет`;
        }

        groups.push({
            label,
            minYears: year,
            maxYears: year,
        });
    }

    return groups;
};
