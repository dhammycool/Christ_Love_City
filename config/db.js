import pkg from 'pg';
import env from 'dotenv';


env.config();
const {Pool}=pkg;
const pool=new Pool({
host:process.env.PGHOST,
user:process.env.PGUSER,
password:process.env.PGPASSWORD,
database:process.env.PGDATABASE,
port:process.env.PGPORT,
});

export default pool;