import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (SQLite)
export const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('❌ Database connection error', err.message);
  } else {
    console.log('✅ Connected to SQLite Database');
    // Initialize database schema
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         email TEXT UNIQUE NOT NULL,
         password_hash TEXT NOT NULL,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database schema initialized');
  }
});

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Enterprise Commerce API is running');
});

import authRoutes from './routes/authRoutes';

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API is healthy' });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
