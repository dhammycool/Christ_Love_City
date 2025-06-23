import pool from '../config/db.js'; 
import chalk from 'chalk'; 


const createChurchHQTable = `
  CREATE TABLE IF NOT EXISTS church_hqs (
    id SERIAL PRIMARY KEY,
    denomination_id INTEGER REFERENCES denominations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    approved_by_super_user BOOLEAN DEFAULT FALSE,
    approved_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`;

const seedChurchHQTable = async () => {
  try {
    await pool.query(createChurchHQTable);
    console.log(chalk.green(' church_hqs table created successfully.'));
  } catch (error) {
    console.error(chalk.red(' Error creating church_hqs table:'), error);
  } finally {
    await pool.end();
    console.log(chalk.blue('Database connection closed.'));
  }
};

seedChurchHQTable();