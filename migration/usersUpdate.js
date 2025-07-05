import pool from '../config/db.js'; 

async function userUpdate(){

const client=await pool.connect();
try{

    await client.query(`
        ALTER TABLE users
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
userUpdate();