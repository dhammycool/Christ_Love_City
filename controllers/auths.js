import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import pool from "../config/db.js";  

passport.use(new Strategy(async function verify(username, password, cb) {
  try {
    console.log("🔑 Authenticating username:", username);

    const check = await pool.query("SELECT * FROM users WHERE email=$1", [username]);

    if (check.rows.length === 0) {
      console.log("❌ User not found.");
      return cb(null, false, { message: "User does not exist. Please register!" });
    }

    const user = check.rows[0];
    const storedPassword = user.password_hash;

    const isMatch = await bcrypt.compare(password, storedPassword);
    
    if (isMatch) {
      console.log("✅ Password matched for user:", user.email);
      return cb(null, user);  
    } else {
      console.log("❌ Incorrect password for user:", user.email);
      return cb(null, false, { message: "Incorrect password" });
    }

  } catch (err) {
    console.log("Authentication error:", err);
    return cb(null, false, { message: "An error occurred during authentication. Please try again." });
  }
}));

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return cb(null, false);
    }
    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
});

export default passport;
