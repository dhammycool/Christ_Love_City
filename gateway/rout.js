import express from 'express';
import pool from '../config/db.js';
import upload from '../middlewares/uploads.js';
import bcrypt from 'bcrypt';
import passport from '../controllers/auths.js';
import methodOverride from 'method-override';
import { checkRole } from '../functions/function.js';

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

router.get("/logout",(req,res)=>{
  req.logout((err)=>{
    if(err)return res.status(500).send("Logout failed");
    res.redirect("/");
  });

});
router.get("/login",(req,res)=>{
    res.render("login.ejs",{title:'Login Page'});
});

router.post('/hq/:id/approve',checkRole([1]), async (req, res) => {
  const { id } = req.params;
  const approverId = req.user.id; 
  const ipAddress = req.ip;
const userAgent = req.headers['user-agent'];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
  `UPDATE church_hqs 
   SET approved_by_super_user=TRUE, approved_by_user_id=$2, updated_at=NOW()
   WHERE id=$1`,
  [id, approverId]
);

    await client.query(
      `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        approverId,
        'Approve HQ',
        `Approved HQ with ID ${id}`,
        ipAddress,
        userAgent 
      ]
    );

    await client.query('COMMIT');
    res.redirect('/super');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send("Internal server error");
  } finally {
    client.release();
  }
});

router.delete('/hq/:id', checkRole([1]), async (req, res) => {
  const { id } = req.params;
  const deleteId = req.user.id; 
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];
  try {
    await pool.query(`DELETE FROM church_hqs WHERE id=$1`, [id]);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        deleteId,
        'Deleted HQ',
        `Deleted HQ with ID ${id}`,
        ipAddress,
        userAgent
      ]
    );

    res.redirect('/super');
  } catch (err) {
    console.log(err);
    res.status(500).send("internal error");
  }
});


router.get('/super',checkRole([1]), async (req, res) => {
  const userName=req.user.full_name;
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM church_hqs) AS total_hqs,
        (SELECT COUNT(*) FROM church_branches) AS total_branches,
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'member')) AS total_members;
    `);

    const approved =await pool.query(`SELECT * FROM church_hqs WHERE approved_by_super_user=FALSE`);

    const counts = result.rows[0];

    res.render('super', {
      users:counts.total_users,
      hq:counts.total_hqs,
      branch:counts.total_branches,
      members:counts.total_members,
      approve:approved.rows,
      Username:userName,
      title: 'Super_Dashboard'
    });
console.log(userName);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal error");
  }
});

router.post('/settings', checkRole([1]), async (req, res) => {
  const { name, email, phone, password } = req.body;
  const userId = req.user.id; 

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET full_name=$1, email=$2, phone_number=$3, password_hash=$4 WHERE id=$5`,
        [name, email, phone, hashedPassword, userId]
      );
    } else {
      await pool.query(
        `UPDATE users SET name=$1, email=$2, phone_number=$3 WHERE id=$4`,
        [name, email, phone, userId]
      );
    }
    res.redirect('/super');
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});


router.get('/hq', checkRole([2]), async (req, res) => {
  const hqId = req.user.hq_id;
  const name = req.user.full_name;

  try {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM church_branches WHERE hq_id = $1) AS total_branches,
        (SELECT COUNT(*) FROM users 
          WHERE role_id = 4 
          AND branch_id IN (
            SELECT id FROM church_branches WHERE hq_id = $1
          )
        ) AS total_members;
    `;

    const { rows } = await pool.query(query, [hqId]);
    const { total_branches, total_members } = rows[0];
const branches = await pool.query(
   `SELECT * FROM church_branches WHERE hq_id=$1 AND approved_by_hq_admin=FALSE`,
  [hqId]
);
    const branchList = branches.rows;

    res.render('hq', { total_branches, total_members, name, branchList, title: 'HeadQuarter' });

  } catch (err) {
    console.log(err);
    res.status(400).send('internal error');
  }
});

router.post('/br/:id/approve', checkRole([2]), async (req, res) => {
  const { id } = req.params;
  const approverId = req.user.id; 
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateResult = await client.query(
      `UPDATE church_branches 
       SET approved_by_hq_admin=TRUE, updated_at=NOW()
       WHERE id=$1`,
      [id]
    );

    console.log(updateResult.rowCount, 'rows updated');

    await client.query(
      `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        approverId,
        'Approve Branch',
        `Approved Branch with ID ${id}`,
        ipAddress,
        userAgent 
      ]
    );

    await client.query('COMMIT');
    res.redirect('/hq');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send("Internal server error");
  } finally {
    client.release();
  }
});

   
router.delete('/br/:id', checkRole([2]), async (req, res) => {
  const { id } = req.params;
  const deleteId = req.user.id; 
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  try {
    await pool.query(`DELETE FROM church_branches WHERE id=$1`, [id]);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        deleteId,
        'Deleted Branch',
        `Deleted Branch with ID ${id}`,
        ipAddress,
        userAgent
      ]
    );

    res.redirect('/hq');
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal error");
  }
});



router.get('/branches',checkRole([3]), (req, res) => {

  res.render('branches',{title:'Church Branch'});

});

router.get('/members', checkRole([4]), (req, res) => {
  res.render('members');
});

router.post('/login', (req, res, next) => {
  
  req.body.username = req.body.email || req.body.Church_Hq_Email || req.body.branch_email;

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
      switch (user.role_id) {
        case 1:
          return res.redirect('/super');
        case 2:
          return res.redirect('/hq');
        case 3:
          return res.redirect('/branches');
        case 4:
          return res.redirect('/members');
        default:
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
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];
  
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
      await client.query(
        `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          adminUserId,
          'REGISTER_BRANCH_ADMIN',
          'HQ Admin registered with HQ ID ' + newHqId,
              ipAddress,
               userAgent
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

      await client.query(
        `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userResult.rows[0].id,
          'REGISTER_BRANCH_ADMIN',
          'Branch Admin registered with Branch ID ' + newBranchId,
             ipAddress,
             userAgent
        ]
      );
    }

  
    else if (role === 'member') {
      if (!hq_id_member || !branch_id) {
        throw new Error('HQ and Branch ID are required for members');
      }


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

      await client.query(
        `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userResult.rows[0].id,
          'REGISTER_MEMBER',
          'Member registered under HQ ID ' + hq_id_member + ' and Branch ID ' + branch_id,
            ipAddress,
            userAgent
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

