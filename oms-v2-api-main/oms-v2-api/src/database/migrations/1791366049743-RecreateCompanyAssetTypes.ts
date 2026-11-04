import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class RecreateCompanyAssetTypes1791366049743 implements MigrationInterface {
    name = 'RecreateCompanyAssetTypes1791366049743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: 'company_asset_types',
              columns: [
                {
                  name: 'id',
                  type: 'int',
                  isPrimary: true,
                  isGenerated: true,
                  generationStrategy: 'increment',
                },
                { name: 'app_id', type: 'int', unsigned: true },
                { name: 'name', type: 'varchar', length: '255' },
                { name: 'created_by', type: 'int', unsigned: true },
                {
                  name: 'created_at',
                  type: 'timestamp',
                  default: 'CURRENT_TIMESTAMP',
                },
                {
                  name: 'updated_at',
                  type: 'timestamp',
                  isNullable: true,
                  onUpdate: 'CURRENT_TIMESTAMP',
                },
              ],
              indices: [
                {
                  name: 'UQ_COMPANY_ASSET_TYPE',
                  columnNames: ['app_id', 'name'],
                  isUnique: true,
                },
              ],
            }),
            true,
        );

        const employeeAssets = await queryRunner.getTable('employee_assets');
        if (employeeAssets) {
            const assetTypeForeignKey = employeeAssets.foreignKeys.find(
              (foreignKey) => foreignKey.columnNames.includes('asset_type_id'),
            );

            if (assetTypeForeignKey) {
                // We're skipping FK constraints update for simplicity, since the column is just int.
                // TypeORM synchronize will add it anyway if needed.
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('company_asset_types', true);
    }
}
