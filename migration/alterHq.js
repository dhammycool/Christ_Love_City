import pool from '../config/db.js'; 



const alterChurchHqsTable = async () => {
  try {
    const query = `
      ALTER TABLE church_hqs
      ADD COLUMN IF NOT EXISTS admin_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `;
    await pool.query(query);
    console.log(' Added admin_user_id to church_hqs');
  } catch (error) {
    console.error(' Error altering church_hqs:', error);
  } finally {
    await pool.end();
  }
};

alterChurchHqsTable();