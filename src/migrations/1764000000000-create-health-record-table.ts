import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateHealthRecordTable1764000000000 implements MigrationInterface {
    name = 'CreateHealthRecordTable1764000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type
        await queryRunner.query(
            `CREATE TYPE "health_record_type_enum" AS ENUM (
                'vaccine',
                'deworming',
                'fleas-and-ticks',
                'vet-visit',
                'lab-test'
            )`,
        );

        // Create the health_record table
        await queryRunner.query(
            `CREATE TABLE "health_record" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" "health_record_type_enum" NOT NULL,
                "animal_id" uuid NOT NULL,
                "date" date NOT NULL,
                "drug_name" character varying,
                "next_due_date" date,
                "notes" text,
                "files" jsonb,
                CONSTRAINT "PK_health_record_id" PRIMARY KEY ("id")
            )`,
        );

        // Add foreign key constraint to animal
        await queryRunner.query(
            `ALTER TABLE "health_record"
             ADD CONSTRAINT "FK_health_record_animal_id"
             FOREIGN KEY ("animal_id") REFERENCES "animal"("id")
             ON DELETE CASCADE ON UPDATE NO ACTION`,
        );

        // Indexes
        await queryRunner.query(
            'CREATE INDEX "IDX_health_record_animal_id" ON "health_record" ("animal_id")',
        );
        await queryRunner.query(
            'CREATE INDEX "IDX_health_record_type" ON "health_record" ("type")',
        );
        await queryRunner.query(
            'CREATE INDEX "IDX_health_record_next_due_date" ON "health_record" ("next_due_date")',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "health_record" DROP CONSTRAINT "FK_health_record_animal_id"',
        );

        await queryRunner.query('DROP INDEX "IDX_health_record_next_due_date"');
        await queryRunner.query('DROP INDEX "IDX_health_record_type"');
        await queryRunner.query('DROP INDEX "IDX_health_record_animal_id"');

        await queryRunner.query('DROP TABLE "health_record"');
        await queryRunner.query('DROP TYPE "health_record_type_enum"');
    }
}
