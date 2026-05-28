import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

let connectionString = process.env.DATABASE_URL;
if (connectionString) {
  if (connectionString.includes('sslmode=require')) {
    connectionString = connectionString.replace('sslmode=require', 'sslmode=no-verify');
  }
  if (connectionString.includes('channel_binding=require')) {
    connectionString = connectionString.replace('channel_binding=require', 'channel_binding=disable');
  }
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query('SELECT id, title, category FROM schemes LIMIT 5');
    console.log(`Found ${res.rowCount} schemes!`);
    res.rows.forEach(r => console.log(`- [${r.category}] ${r.title}`));
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

check();
