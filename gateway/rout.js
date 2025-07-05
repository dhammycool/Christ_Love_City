import express from 'express';
import pool from '../config/db.js';
import upload from '../middlewares/uploads.js';
import bcrypt from 'bcrypt';
import passport from '../controllers/auths.js';

const router= express.Router();


router.get("/",(req,res)=>{
    res.render("index.ejs",{title:'Home'});
});


router.get("/about",(req,res)=>{
    res.render("about.ejs",{title:'About Us'});
})

router.get("/contact",(req,res)=>{
    res.render("contact.ejs",{title:'Contact'});

})

router.get("/minister",(req,res)=>{
    res.render("minister.ejs",{title:'Our Ministers'});
});


router.get("/login",(req,res)=>{
    res.render("login.ejs",{title:'Login Page'});
});


router.post('/login', (req, res, next) => {
  if (req.body.email) {
    req.body.username = req.body.email;
  } else if (req.body.Church_Hq_Email) {
    req.body.username = req.body.Church_Hq_Email;
  } else if (req.body.branch_email) {
    req.body.username = req.body.branch_email;
  }

  console.log("📝 Login attempt with username:", req.body.username);

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return next(err);
    }
    if (!user) {
      console.log("Login failed:", info);
      return res.redirect('/register'); 
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Login session error:", err);
        return next(err);
      }

      console.log("✅ User logged in successfully:", user.email);

  
      if (user.role_id === 1) { 
        return res.redirect('/contact');
      } else if (user.role_id === 2) {
        return res.redirect('/about');
      } else if (user.role_id === 3) {
        return res.redirect('/about');
      } else if (user.role_id === 4) {
        return res.redirect('/minister');
      } else {
        return res.redirect('/register'); 
      }
    });
  })(req, res, next);
});


router.get("/register", async(req,res) => {

  try {
   
    const denominationsResult = await pool.query("SELECT id, name FROM denominations ORDER BY name");

   
    const rolesResult = await pool.query(`
      SELECT id, name FROM roles
      WHERE name IN ('member', 'branch_admin', 'hq_admin')
      ORDER BY name
    `);

    
    const hqResult = await pool.query("SELECT id, name FROM church_hqs ORDER BY name");

    
    const branchResult = await pool.query("SELECT id, name, hq_id FROM church_branches ORDER BY name");

    res.render("register.ejs", {
      denominations: denominationsResult.rows,
      roles: rolesResult.rows,
      hqList: hqResult.rows,
      branches: branchResult.rows,
      title:'Registration',
    });

  } catch (err) {
    console.error("Error loading register form:", err);
    res.status(500).send("Server error loading registration form");
  }
});



router.post('/register', upload, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const {
      role,
      full_name,
      email,
      Phone_number,
      password,
      gender,
      date_of_birth,
      bio,
      hq_id,
      hq_id_member,
      branch_id,
      church_name,
      denomination_id,
      Church_Hq_Email,
      Church_Hq_mobile,
      Church_Hq_Address,
      branch_name,
      branch_address,
      branch_email,
      branch_mobile
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const profile_photo = req.file ? req.file.filename : null;
    const birthDate = new Date(date_of_birth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
   if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
   age--;
}
if(age<18){
    return res.status(400).send('You must be at least 18 years old to register.');
}
    
    const roleResult = await client.query(
      'SELECT id FROM roles WHERE name = $1',
      [role]
    );

    if (roleResult.rowCount === 0) {
      throw new Error('Invalid role selected');
    }

    const roleId = roleResult.rows[0].id;

    let newHqId = null;
    let newBranchId = null;
    let userResult;
    let adminUserId;
   


    if (role === 'hq_admin') {
      
      const denominationCheck = await client.query(
        'SELECT id FROM denominations WHERE id = $1',
        [denomination_id]
      );

      if (denominationCheck.rowCount === 0) {
        throw new Error('Invalid denomination');
      }

      // Insert into church_hqs
      const hqInsert = await client.query(
        `INSERT INTO church_hqs (denomination_id, name, email, phone_number, address)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [denomination_id, church_name, Church_Hq_Email, Church_Hq_mobile, Church_Hq_Address]
      );

      newHqId = hqInsert.rows[0].id;

      // Insert the admin user
      userResult = await client.query(
        `INSERT INTO users (
          hq_id, role_id, full_name, email, phone_number,
          password_hash, gender, date_of_birth,
          profile_photo, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          newHqId,
          roleId,
          full_name,
          email,
          Phone_number,
          hashedPassword, 
          gender,
          date_of_birth,
          profile_photo,
          bio
        ]
      );

      adminUserId = userResult.rows[0].id;
      await client.query(
        `UPDATE church_hqs SET admin_user_id = $1, updated_at=NOW()  WHERE id = $2`,
        [adminUserId, newHqId]
      );

     // ✅ Insert audit log
      await client.query(
        `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          adminUserId,
          'REGISTER_BRANCH_ADMIN',
          'HQ Admin registered with HQ ID ' + newHqId,
          process.env.ipAddress,
          process.env.userAgent
        ]
      );

    }

   
    else if (role === 'branch_admin') {
      if (!hq_id) throw new Error('HQ ID is required for branch admin');

      const branchInsert = await client.query(
        `INSERT INTO church_branches (hq_id, name, address, email, phone_number)
         VALUES ($1, $2,$3,$4,$5) RETURNING id`,
        [hq_id,  branch_name, branch_address, branch_email, branch_mobile,]
      );

      newBranchId = branchInsert.rows[0].id;

      // Insert user
      userResult = await client.query(
        `INSERT INTO users (
          hq_id, branch_id, role_id, full_name, email, phone_number,
          password_hash, gender, date_of_birth,
          profile_photo, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          hq_id,
          newBranchId,
          roleId,
          full_name,
          email,
          Phone_number,
          hashedPassword,
          gender,
          date_of_birth,
          profile_photo,
          bio
        ]
      );

           // ✅ Insert audit log
      await client.query(
        `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userResult.rows[0].id,
          'REGISTER_BRANCH_ADMIN',
          'Branch Admin registered with Branch ID ' + newBranchId,
           process.env.ipAddress,
          process.env.userAgent
        ]
      );
    }

    // 👤 Handle Member
    else if (role === 'member') {
      if (!hq_id_member || !branch_id) {
        throw new Error('HQ and Branch ID are required for members');
      }

      // Insert user
     userResult= await client.query( `INSERT INTO users (hq_id, branch_id, role_id, full_name, email, phone_number, password_hash, gender, date_of_birth, profile_photo, bio) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)  RETURNING id`,
        [
          hq_id_member,
          branch_id,
          roleId,
          full_name,
          email,
          Phone_number,
          hashedPassword,
          gender,
          date_of_birth,
          profile_photo,
          bio
        ]
      );

       // ✅ Insert audit log
      await client.query(
        `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userResult.rows[0].id,
          'REGISTER_MEMBER',
          'Member registered under HQ ID ' + hq_id_member + ' and Branch ID ' + branch_id,
          process.env.ipAddress,
          process.env.userAgent
        ]
      );
    }

    await client.query('COMMIT');
    res.status(200).send('✅ Registration successful!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Registration error:', err.stack);
    res.status(500).send(err.message || 'Registration failed');
  } finally {
    client.release();
  }
});

export default router;

