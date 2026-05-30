import { type Animal } from './animal';

export enum HealthRecordType {
    VACCINE = 'vaccine',
    DEWORMING = 'deworming',
    FLEAS_AND_TICKS = 'fleas-and-ticks',
    VET_VISIT = 'vet-visit',
    LAB_TEST = 'lab-test',
}

export type HealthRecordFile = {
    name: string;
    link: string;
};

export type HealthRecord = {
    id: string;
    type: HealthRecordType;
    date: Date;

    // Required for vaccine, deworming, fleas-and-ticks
    drug_name?: string;
    // Optional for vaccine, deworming, fleas-and-ticks
    next_due_date?: Date;

    notes?: string;

    // Attached files (vet visit reports, lab results, vaccine certificates, etc.)
    files?: HealthRecordFile[];

    animal_id?: string;
    animal: Animal;
};
