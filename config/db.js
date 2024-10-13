import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const db = new pg.Client(dbConfig);

async function connectDatabase() {
  try {
    await db.connect();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Database connection error', error.stack);
  }
}

export { db, connectDatabase };
