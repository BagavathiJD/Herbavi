import { getPool } from '../backend/db/pool';

async function main() {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT id, user_name, email, phone_number, role, created_at FROM users');
  console.log('Users:', rows);
  await pool.end();
}

main().catch((err) => {
  console.error('ERROR', err);
  process.exit(1);
});
