import PDFDocument from 'pdfkit';

import { type HealthRecord } from '../database/entities/health-record.entity';
import { type Animal } from '../database/entities/animal.entity';

export type VaccinationRow = {
    animal: Pick<Animal, 'id' | 'name'>;
    record: Pick<HealthRecord, 'date' | 'drug_name'>;
};

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
    doc: PDFKit.PDFDocument,
    title: string,
    rows: VaccinationRow[],
): void => {
    doc.fontSize(18).text(title, { underline: true });
    doc.moveDown(0.5);

    if (rows.length === 0) {
        doc.fontSize(12).text('No records');
        doc.moveDown();
        return;
    }

    const tableTop = doc.y;
    const startX = doc.page.margins.left;
    const pageWidth =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const cols = [
        { label: 'N', width: 30 },
        { label: 'Name', width: 150 },
        { label: 'Date - Drug name', width: pageWidth - 30 - 150 },
    ];

    const drawHeader = (y: number): void => {
        let x = startX;
        doc.fontSize(12).font('Helvetica-Bold');
        cols.forEach((col) => {
            doc.text(col.label, x + 4, y + 4, {
                width: col.width - 8,
            });
            x += col.width;
        });
        doc.moveTo(startX, y + 20)
            .lineTo(startX + pageWidth, y + 20)
            .stroke();
        doc.font('Helvetica');
    };

    drawHeader(tableTop);
    let currentY = tableTop + 24;

    rows.forEach((row, idx) => {
        const n = String(idx + 1);
        const name = row.animal.name;
        const dateDrug = `${formatDate(row.record.date)} - ${
            row.record.drug_name ?? ''
        }`;

        const rowHeight = Math.max(
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

export const generateVaccinationReport = (
    dogs: VaccinationRow[],
    cats: VaccinationRow[],
): PDFKit.PDFDocument => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.fontSize(22).text('Vaccination report', { align: 'center' });
    doc.moveDown();

    renderSection(doc, 'Dogs', dogs);
    doc.moveDown();
    renderSection(doc, 'Cats', cats);

    return doc;
};
