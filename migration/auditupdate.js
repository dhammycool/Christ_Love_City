import pool from '../config/db.js'; 

const alterAuditTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE audit_logs
      ALTER COLUMN ip_address TYPE VARCHAR(100);
    `);

    console.log("audit_logs table updated.");
  } catch (err) {
    console.error("Error altering audit_logs table:", err);
  } finally {
    client.release();
  }
};

alterAuditTable();
