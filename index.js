import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import pool from './config/db.js';
import router from './gateway/rout.js';
import passport from 'passport';
import methodOverride from 'method-override';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use("/uploads", express.static("uploads"));
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24,
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
  res.locals.user=req.user || null;
  next();
});

app.use("/", router);
app.use("/rout", router);

process.on("SIGINT", async () => {
  try {
    await pool.end();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (err) {
    console.log("Error closing DB:", err);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  try {
    await pool.end();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (err) {
    console.log("Error closing DB:", err);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
