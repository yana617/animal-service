import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateAnimalsTable1724708886546 implements MigrationInterface {
    name = 'UpdateAnimalsTable1724708886546';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "animal" ADD "photos" text NOT NULL',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "animal" DROP COLUMN "photos"');
    }
}
