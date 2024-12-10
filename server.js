import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import routes from './src/routes/protectedRoutes.js';
import dotenv from 'dotenv';
import pgSession from 'connect-pg-simple';
import pg from 'pg';
import smsController from './src/controllers/smsController.js';

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
  port: parseInt(process.env.DB_PORT, 10), // Ensure port is a number
});

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // To handle JSON payloads


const PgSessionStore = pgSession(session);

app.use(session({
  store: new PgSessionStore({
    pool, // Use the pg pool
    tableName: 'session', // Optional: Default is 'session'
  }),
  secret: process.env.SESSION_SECRET, // Store this securely
  resave: false, // Prevents saving session if unmodified
  saveUninitialized: false, // Don't save uninitialized sessions
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // Set to 1 day in milliseconds, adjust as needed
    httpOnly: true, // Prevents client-side access to the cookie
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    sameSite: 'lax', // Helps prevent CSRF
  },
}));


app.use(passport.initialize());
app.use(passport.session());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Use routes
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
