

import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function createSuperUser() {
  const client = await pool.connect();

  try {
    const hashedPassword = await bcrypt.hash(process.env.SUPER_USER_PASSWORD, 10);

  const result = await client.query(`
  INSERT INTO users (full_name, email, phone_number, password_hash, role_id, is_approved)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (email) DO NOTHING
  RETURNING id
`, [
  process.env.SUPER_USER_NAME || 'Super User',
  process.env.SUPER_USER_EMAIL,
  process.env.SUPER_USER_PHONE || '07478619827',
  hashedPassword,
  process.env.SUPER_USER_ROLE_ID || 1,
  process.env.SUPER_IS_APPROVED
]);

if (result.rows.length > 0) {
  const check = result.rows[0].id;

  // ✅ Insert audit log
  await client.query(
    `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      check,
      'REGISTER_SUPER_ADMIN',
      'Super with role_id ' + process.env.SUPER_USER_ROLE_ID + ' created',
      process.env.ipAddress,
      process.env.userAgent
    ]
  );

  console.log("✅ Super user created successfully.");
} else {
  console.log("ℹ️ Super user already exists. No new user created.");
}
  } catch (err) {
    console.error("❌ Error creating super user:", err);
  } finally {
    client.release();
    process.exit(); // exit script
  }
}

createSuperUser();