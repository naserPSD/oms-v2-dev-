import 'dotenv/config';
import AppDataSource from './data-source';

async function checkViewIncome() {
  await AppDataSource.initialize();

  const rows = await AppDataSource.query(`
    SELECT rp.*, p.code, p.name, r.name as role_name
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    JOIN roles r ON r.id = rp.role_id
    WHERE p.code IN ('accounts.income.view', 'accounts.income.create', 'accounts.income')
  `);

  console.log('Role Permissions for Accounts Income:', rows);

  await AppDataSource.destroy();
}

checkViewIncome();
