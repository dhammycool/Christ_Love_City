import pool from '../config/db.js';


const createRolesTable = `
  CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    can_approve BOOLEAN DEFAULT FALSE,
    can_manage_branches BOOLEAN DEFAULT FALSE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

const insertRoles = `
  INSERT INTO roles (name, description, can_approve, can_manage_branches, can_manage_users, is_admin)
  VALUES
    ('super_user', 'System-wide super administrator', TRUE, TRUE, TRUE, TRUE),
    ('hq_admin', 'Admin for a church HQ', TRUE, TRUE, TRUE, TRUE),
    ('branch_admin', 'Admin for a branch', TRUE, FALSE, TRUE, TRUE),
    ('member', 'Regular user or church member', FALSE, FALSE, FALSE, FALSE)
  ON CONFLICT (name) DO NOTHING;
`;

const seedRoles = async () => {
  try {
    await pool.query(createRolesTable);
    console.log('Roles table created (if not exists).');

    await pool.query(insertRoles);
    console.log(' Default roles inserted.');
  } catch (err) {
    console.error(' Error seeding roles:', err.message);
  } finally {
    await pool.end();
  }
};

seedRoles()