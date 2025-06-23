import express from 'express';
import pool from '../config/db.js';

const router= express.Router();


router.get("/",(req,res)=>{
    res.render("index.ejs",{title:'Home'});
})


router.get("/about",(req,res)=>{
    res.render("about.ejs",{title:'About Us'});
})

router.get("/contact",(req,res)=>{
    res.render("contact.ejs",{title:'Contact'});

})

router.get("/minister",(req,res)=>{
    res.render("minister.ejs",{title:'Our Ministers'});
})

router.get("/register",(req,res)=>{
    try{

        res.render("register.ejs",{title:'Registration'});
        
    }catch(err){

    }
    
})

export default router;