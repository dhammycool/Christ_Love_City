import express from 'express';
import { fileURLToPath } from 'url';
import path, {dirname} from 'path';
import ejs from 'ejs';
import expressLayouts from 'express-ejs-layouts';
import pool from './config/db.js';
import router from './gateway/rout.js';

const app =express();
const PORT=process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname =path.dirname(__filename);

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout','layout');
app.use(express.static(path.join(__dirname,'public')));

app.use("/",router);
app.use("/rout", router);


process.on("SIGINT", async() =>{
    try{
        await pool.end();
        console.log("Database connection closed.");
        process.exit(0);
    }catch(err){
        console.log("Error closing DB:",err);
        process.exit(1);
    }
});

process.on("SIGTERM", async () => {
    try{
        await pool.end();
        console.log("Database connection closed,");
        process.exit(0);
    }catch(err){
        console.log("Error closing DB:",err);
    }
});

app.listen(PORT, ()=>{
    console.log(`server is running on http://localhost:${PORT}`);

});