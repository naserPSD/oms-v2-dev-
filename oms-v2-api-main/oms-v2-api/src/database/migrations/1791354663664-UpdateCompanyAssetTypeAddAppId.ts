import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompanyAssetTypeAddAppId1791354663664 implements MigrationInterface {
    name = 'UpdateCompanyAssetTypeAddAppId1791354663664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the old unique index
        await queryRunner.query(`ALTER TABLE \`company_asset_types\` DROP INDEX \`UQ_114ab4b66f29c40c632af2f44f2\``);
        // Add app_id column
        await queryRunner.query(`ALTER TABLE \`company_asset_types\` ADD \`app_id\` int UNSIGNED NOT NULL`);
        // Add new composite unique index
        await queryRunner.query(`ALTER TABLE \`company_asset_types\` ADD UNIQUE INDEX \`UQ_COMPANY_ASSET_TYPE\` (\`app_id\`, \`name\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`company_asset_types\` DROP INDEX \`UQ_COMPANY_ASSET_TYPE\``);
        await queryRunner.query(`ALTER TABLE \`company_asset_types\` DROP COLUMN \`app_id\``);
        await queryRunner.query(`ALTER TABLE \`company_asset_types\` ADD UNIQUE INDEX \`UQ_114ab4b66f29c40c632af2f44f2\` (\`name\`)`);
    }
}
