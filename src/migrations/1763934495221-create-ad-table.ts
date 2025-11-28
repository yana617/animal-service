import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateAdTable1763934495221 implements MigrationInterface {
    name = 'CreateAdTable1763934495221';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the ad table
        await queryRunner.query(
            `CREATE TABLE "ad" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "platform_id" uuid NOT NULL,
                "animal_id" uuid NOT NULL,
                "date" date NOT NULL,
                CONSTRAINT "PK_ad_id" PRIMARY KEY ("id")
            )`,
        );

        // Add foreign key constraints
        await queryRunner.query(
            `ALTER TABLE "ad" 
             ADD CONSTRAINT "FK_ad_platform_id" 
             FOREIGN KEY ("platform_id") REFERENCES "platform"("id") 
             ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );

        await queryRunner.query(
            `ALTER TABLE "ad" 
             ADD CONSTRAINT "FK_ad_animal_id" 
             FOREIGN KEY ("animal_id") REFERENCES "animal"("id") 
             ON DELETE CASCADE ON UPDATE NO ACTION`,
        );

        // Add indexes for better performance
        await queryRunner.query(
            'CREATE INDEX "IDX_ad_animal_id" ON "ad" ("animal_id")',
        );

        await queryRunner.query(
            'CREATE INDEX "IDX_ad_platform_id" ON "ad" ("platform_id")',
        );

        await queryRunner.query(
            'CREATE INDEX "IDX_ad_user_id" ON "ad" ("user_id")',
        );

        await queryRunner.query('CREATE INDEX "IDX_ad_date" ON "ad" ("date")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(
            'ALTER TABLE "ad" DROP CONSTRAINT "FK_ad_animal_id"',
        );
        await queryRunner.query(
            'ALTER TABLE "ad" DROP CONSTRAINT "FK_ad_platform_id"',
        );

        // Drop indexes
        await queryRunner.query('DROP INDEX "IDX_ad_date"');
        await queryRunner.query('DROP INDEX "IDX_ad_user_id"');
        await queryRunner.query('DROP INDEX "IDX_ad_platform_id"');
        await queryRunner.query('DROP INDEX "IDX_ad_animal_id"');

        // Drop the table
        await queryRunner.query('DROP TABLE "ad"');
    }
}
