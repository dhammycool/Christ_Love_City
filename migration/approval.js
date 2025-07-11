import pool from '../config/db.js'; 

async function church(){

const client=await pool.connect();
try{

    await client.query(`
        ALTER TABLE church_hqs
ADD COLUMN approved_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

        
        `);
console.log("removed from updated");
}catch(err){
console.error("Default Now() removed from updated_at")
}finally{
client.release();
process.exit();
}

}
church();