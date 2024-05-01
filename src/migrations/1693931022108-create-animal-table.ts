import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreteAnimalTable1693931022108 implements MigrationInterface {
  name = 'CreteAnimalTable1693931022108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "public"."animal_type_enum" AS ENUM(\'cat\', \'dog\', \'other\')');
    await queryRunner.query('CREATE TYPE "public"."animal_place_enum" AS ENUM(\'main-house\', \'cat-house\', \'quarantine-house\', \'aviary\', \'on-temporary-hold\')');
    await queryRunner.query('CREATE TYPE "public"."animal_sex_enum" AS ENUM(\'male\', \'female\')');
    await queryRunner.query('CREATE TYPE "public"."animal_status_enum" AS ENUM(\'homeless\', \'at-home\', \'preparation\', \'died\', \'lost\')');
    await queryRunner.query('CREATE TABLE "animal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."animal_type_enum" NOT NULL, "place" "public"."animal_place_enum" NOT NULL, "room" integer, "birthday" TIMESTAMP NOT NULL, "sex" "public"."animal_sex_enum" NOT NULL, "description" character varying, "secondBirthday" TIMESTAMP NOT NULL, "status" "public"."animal_status_enum" NOT NULL, "advertisingText" character varying, "height" integer, "sterilized" boolean NOT NULL DEFAULT false, "takenHomeDate" TIMESTAMP, "curator_id" character varying, CONSTRAINT "PK_af42b1374c042fb3fa2251f9f42" PRIMARY KEY ("id"))');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "animal"');
    await queryRunner.query('DROP TYPE "public"."animal_status_enum"');
    await queryRunner.query('DROP TYPE "public"."animal_sex_enum"');
    await queryRunner.query('DROP TYPE "public"."animal_place_enum"');
    await queryRunner.query('DROP TYPE "public"."animal_type_enum"');
  }
}
