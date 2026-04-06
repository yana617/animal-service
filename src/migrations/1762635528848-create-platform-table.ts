import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreatePlatformTable1762635528848 implements MigrationInterface {
    name = 'CreatePlatformTable1762635528848';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE "platform" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_platform_id" PRIMARY KEY ("id"))',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "platform"');
    }
}
