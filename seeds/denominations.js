import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config();

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS denominations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

const insertDataQuery = `
  INSERT INTO denominations (name, description)
  VALUES
    ('Pentecostal', 'Churches emphasizing the work of the Holy Spirit and spiritual gifts.'),
    ('Catholic', 'The Roman Catholic Church led by the Pope.'),
    ('Anglican', 'Also known as the Church of England and its global branches.'),
    ('Baptist', 'Churches with roots in believer’s baptism and congregational governance.'),
    ('Methodist', 'Churches based on the teachings of John Wesley.'),
    ('Evangelical', 'Churches emphasizing personal faith and the authority of Scripture.'),
    ('Others', 'Other independent or non-denominational churches.')
  ON CONFLICT (name) DO NOTHING;
`;

const seedDenominations = async () => {
  try {
    await pool.query(createTableQuery);
    console.log('Denominations table created.');

    await pool.query(insertDataQuery);
    console.log(' Denominations seeded.');
  } catch (err) {
    console.error(' Error seeding denominations:', err.message);
  } finally {
    await pool.end();
  }
};

seedDenominations();