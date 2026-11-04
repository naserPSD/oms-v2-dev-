import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const requisitionTrainingColumns = [
  'training_type',
  'preferred_training_date',
  'training_provider',
  'reason',
  'additional_notes',
];

export class RemoveTrainingRequestFieldsFromRequisitions1791117000000
  implements MigrationInterface
{
  name = 'RemoveTrainingRequestFieldsFromRequisitions1791117000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const column of requisitionTrainingColumns) {
      if (await queryRunner.hasColumn('requisitions', column)) {
        await queryRunner.dropColumn('requisitions', column);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      new TableColumn({
        name: 'training_type',
        type: 'varchar',
        length: '32',
        isNullable: true,
      }),
      new TableColumn({
        name: 'preferred_training_date',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'training_provider',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'reason',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'additional_notes',
        type: 'text',
        isNullable: true,
      }),
    ];

    for (const column of columns) {
      if (!(await queryRunner.hasColumn('requisitions', column.name))) {
        await queryRunner.addColumn('requisitions', column);
      }
    }
  }
}
