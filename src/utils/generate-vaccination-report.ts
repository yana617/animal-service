import path from 'path';

import PDFDocument from 'pdfkit';

import { type HealthRecord } from '../database/entities/health-record.entity';
import { type Animal } from '../database/entities/animal.entity';

export type VaccinationRow = {
    animal: Pick<Animal, 'id' | 'name'>;
    record: Pick<HealthRecord, 'date' | 'drug_name'>;
};

const FONT_REGULAR = 'CyrillicRegular';
const FONT_BOLD = 'CyrillicBold';

const FONT_REGULAR_PATH = path.join(
    __dirname,
    '../assets/fonts/Roboto-Regular.ttf',
);
const FONT_BOLD_PATH = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');

const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) {
        return '';
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
};

const renderSection = (
    doc: InstanceType<typeof PDFDocument>,
    title: string,
    rows: VaccinationRow[],
): void => {
    doc.fontSize(18)
        .font(FONT_BOLD)
        .text(title, doc.page.margins.left, doc.y, { underline: true });
    doc.font(FONT_REGULAR);
    doc.moveDown(0.5);

    if (rows.length === 0) {
        doc.fontSize(12).text('Нет записей');
        doc.moveDown();
        return;
    }

    const tableTop = doc.y;
    const startX = doc.page.margins.left;
    const pageWidth =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const cols = [
        { label: '№', width: 30 },
        { label: 'Кличка', width: 150 },
        { label: 'Дата - Препарат', width: pageWidth - 30 - 150 },
    ];

    const drawHeader = (y: number): void => {
        let x = startX;
        doc.fontSize(12).font(FONT_BOLD);
        cols.forEach((col) => {
            doc.text(col.label, x + 4, y + 4, {
                width: col.width - 8,
            });
            x += col.width;
        });
        doc.font(FONT_REGULAR);
    };

    drawHeader(tableTop);
    let currentY = tableTop + 24;

    rows.forEach((row, idx) => {
        const n = String(idx + 1);
        const name = row.animal.name;
        const dateDrug = `${formatDate(row.record.date)} - ${
            row.record.drug_name ?? ''
        }`;

        const rowHeight =
            Math.max(
                doc.heightOfString(n, { width: cols[0].width - 8 }),
                doc.heightOfString(name, { width: cols[1].width - 8 }),
                doc.heightOfString(dateDrug, { width: cols[2].width - 8 }),
            ) + 8;

        if (currentY + rowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            currentY = doc.page.margins.top;
            drawHeader(currentY);
            currentY += 24;
        }

        let x = startX;
        doc.fontSize(12).text(n, x + 4, currentY + 4, {
            width: cols[0].width - 8,
        });
        x += cols[0].width;
        doc.text(name, x + 4, currentY + 4, { width: cols[1].width - 8 });
        x += cols[1].width;
        doc.text(dateDrug, x + 4, currentY + 4, { width: cols[2].width - 8 });

        currentY += rowHeight;
    });

    doc.y = currentY;
    doc.moveDown();
};

const getLatestVaccination = (rows: VaccinationRow[]): VaccinationRow[] => {
    const latestRecords: Record<string, VaccinationRow> = {};
    rows.forEach((row) => {
        if (
            !latestRecords[row.animal.id] ||
            new Date(row.record.date) >
                new Date(latestRecords[row.animal.id].record.date)
        ) {
            latestRecords[row.animal.id] = row;
        }
    });
    return Object.values(latestRecords);
};

export const generateVaccinationReport = (
    dogs: VaccinationRow[],
    cats: VaccinationRow[],
): InstanceType<typeof PDFDocument> => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.registerFont(FONT_REGULAR, FONT_REGULAR_PATH);
    doc.registerFont(FONT_BOLD, FONT_BOLD_PATH);
    doc.font(FONT_REGULAR);

    doc.fontSize(22).font(FONT_BOLD).text('Вакцинации', {
        align: 'center',
    });
    doc.font(FONT_REGULAR);
    doc.moveDown();

    renderSection(doc, 'Собаки', getLatestVaccination(dogs));
    doc.moveDown(3);
    renderSection(doc, 'Кошки', getLatestVaccination(cats));

    return doc;
};
