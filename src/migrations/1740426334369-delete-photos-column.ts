import {
    type MigrationInterface,
    type QueryRunner,
    TableColumn,
} from 'typeorm';

export class Migrations1740426334369 implements MigrationInterface {
    name = 'Migrations1740426334369';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('animal', 'photos');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'animal',
            new TableColumn({
                name: 'photos',
                type: 'varchar',
                isNullable: false,
            }),
        );
    }
}
