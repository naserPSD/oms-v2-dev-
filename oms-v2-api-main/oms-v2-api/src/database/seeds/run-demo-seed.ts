import 'dotenv/config';
import AppDataSource from '../data-source';
import { runSqlFile } from '../utils/run-sql-file';

async function main() {
  const seedFile = process.argv[2] || 'sql/seeds/001_demo_seed.sql';

  console.log(
    `Connecting to ${process.env.MYSQL_DATABASE || 'revinr_oms_new'}...`,
  );
  const dataSource = await AppDataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    console.log(`Running seed: ${seedFile}`);
    await runSqlFile(queryRunner, seedFile);
    console.log('Demo seed completed successfully.');
    console.log('Login: demo@revinr.local / Demo@12345');
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
