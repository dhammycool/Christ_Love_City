import pool from '../config/db.js';
import chalk from 'chalk';

const createChurchBranchesTable = `
  CREATE TABLE IF NOT EXISTS church_branches (
    id SERIAL PRIMARY KEY,
    hq_id INTEGER REFERENCES church_hqs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    approved_by_hq_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`;

const seedChurchBranchesTable = async () => {
  try {
    await pool.query(createChurchBranchesTable);
    console.log(chalk.green('✅ church_branches table created successfully.'));
  } catch (error) {
    console.error(chalk.red('❌ Error creating church_branches table:'), error);
  } finally {
    await pool.end();
    console.log(chalk.blue('🔌 Database connection closed.'));
  }
};

seedChurchBranchesTable();