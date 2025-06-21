import express from 'express';
import { fileURLToPath } from 'url';
import path, {dirname} from 'path';

import ejs from 'ejs';
import expressLayouts from 'express-ejs-layouts';

const app =express();
const PORT=process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname =path.dirname(__filename);

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout','layout');
app.use(express.static(path.join(__dirname,'public')));

app.get("/",(req,res)=>{
    res.render("index.ejs",{title:'Home'});
})


app.get("/about",(req,res)=>{
    res.render("about.ejs",{title:'About Us'});
})

app.get("/contact",(req,res)=>{
    res.render("contact.ejs",{title:'Contact'});

})

app.get("/minister",(req,res)=>{
    res.render("minister.ejs",{title:'Our Ministers'});
})

app.listen(PORT, ()=>{
    console.log(`server is running on http://localhost:${PORT}`);

});