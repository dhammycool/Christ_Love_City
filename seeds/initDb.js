import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
 host:process.env.PGHOST,
user:process.env.PGUSER,
password:process.env.PGPASSWORD,
database:'postgres',
port:process.env.PGPORT,
});

const dbName = 'Christ_Love_City';

const createDb = async () => {
  try {
    await pool.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Database "${dbName}" created successfully.`);
  } catch (err) {
    console.error(`❌ Error creating database:`, err.message);
  } finally {
    await pool.end();
  }
};

createDb();