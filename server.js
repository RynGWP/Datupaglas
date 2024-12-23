import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import session from 'express-session';
import customPassport from './src/config/passport.js'; // Renamed import
import routes from './src/routes/protectedRoutes.js';
import dotenv from 'dotenv';
import pgSession from 'connect-pg-simple';
import pg from 'pg';
import smsController from './src/controllers/smsController.js';
import { db, connectDatabase } from "./config/db.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT;
const app = express();
const __dirname = path.resolve();

const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10), 
});

// Database connection
connectDatabase();

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PgSessionStore = pgSession(session);

app.use(session({
  store: new PgSessionStore({
    pool, 
    tableName: 'session', 
  }),
  secret: process.env.SESSION_SECRET,
  resave: false, 
  saveUninitialized: false, 
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', 
  },
}));

// Initialize Passport
app.use(customPassport.initialize());
app.use(customPassport.session());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Use routes
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
