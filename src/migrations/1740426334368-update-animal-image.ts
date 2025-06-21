import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migrations1740426334368 implements MigrationInterface {
    name = 'Migrations1740426334368';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE animal_image 
            ALTER COLUMN animal_id SET NOT NULL;
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE animal_image 
            ALTER COLUMN image_key DROP NOT NULL;
          `);
    }
}
