import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Migrations1740426334367 implements MigrationInterface {
    name = 'Migrations1740426334367';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE "animal_image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image_key" character varying NOT NULL, "display_order" integer NOT NULL DEFAULT \'1\', "animal_id" uuid, CONSTRAINT "UQ_8c55bdf9249c89331849b074b99" UNIQUE ("animal_id", "display_order"), CONSTRAINT "PK_3200e4a01b8524fc08017452b18" PRIMARY KEY ("id"))',
        );
        await queryRunner.query(
            'ALTER TABLE "animal_image" ADD CONSTRAINT "FK_440f53d808a2c1a3bc96ba865f9" FOREIGN KEY ("animal_id") REFERENCES "animal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "animal_image" DROP CONSTRAINT "FK_440f53d808a2c1a3bc96ba865f9"',
        );
        await queryRunner.query('DROP TABLE "animal_image"');
    }
}
