import 'dotenv/config';
import AppDataSource from './data-source';

async function checkUserPermissionsTable() {
  await AppDataSource.initialize();

  const userPerms = await AppDataSource.query(`
    SELECT up.*, p.code, p.name
    FROM user_permissions up
    JOIN permissions p ON p.id = up.permission_id
    WHERE up.user_id = 12
  `);

  console.log('Direct User Permissions for User 12:', userPerms);

  await AppDataSource.destroy();
}

checkUserPermissionsTable();
