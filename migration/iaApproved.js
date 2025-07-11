import pool from '../config/db.js'; 


async function setIsApprovedTrue() {
  try {
    
    await pool.query(`
      ALTER TABLE users
      ALTER COLUMN is_approved SET DEFAULT TRUE;
    `);
    console.log(" is_approved default set to TRUE successfully");


    const result = await pool.query(`
      UPDATE users
      SET is_approved = TRUE,
          updated_at = NOW()
      WHERE is_approved IS NOT TRUE;
    `);
    console.log(`Updated ${result.rowCount} existing records to TRUE and updated_at to NOW()`);

  } catch (err) {
    console.error(" Error updating is_approved", err);
  } finally {
    pool.end();
  }
}

setIsApprovedTrue();
