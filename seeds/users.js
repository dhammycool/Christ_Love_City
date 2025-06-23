import pool from '../config/db.js';
import chalk from 'chalk';

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    hq_id INTEGER REFERENCES church_hqs(id) ON DELETE SET NULL,
    branch_id INTEGER REFERENCES church_branches(id) ON DELETE SET NULL,
    role_id INTEGER REFERENCES roles(id),

    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password_hash TEXT NOT NULL,

    gender VARCHAR(10),
    date_of_birth DATE,
    profile_photo TEXT,
    bio TEXT,  -- New field for personal description

    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`;

const seedUsersTable = async () => {
  try {
    await pool.query(createUsersTable);
    console.log(chalk.green('✅ users table created successfully.'));
  } catch (error) {
    console.error(chalk.red('❌ Error creating users table:'), error);
  } finally {
    await pool.end();
    console.log(chalk.blue('🔌 Database connection closed.'));
  }
};

seedUsersTable();