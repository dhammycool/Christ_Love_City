import pool from '../config/db.js'; 

async function Update(){

const client=await pool.connect();
try{

    await client.query(`
        ALTER TABLE church_hqs
        ALTER COLUMN updated_at DROP DEFAULT;
        
        `);
console.log("removed from updated");
}catch(err){
console.error("Default Now() removed from updated_at")
}finally{
client.release();
process.exit();
}

}
Update();