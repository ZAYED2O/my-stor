import { Router, Request, Response } from 'express';
import { db } from '../index';
import crypto from 'crypto';

const router = Router();

// Utility function to hash passwords natively
const hashPassword = (password: string) => {
   const salt = crypto.randomBytes(16).toString('hex');
   const hash = crypto.scryptSync(password, salt, 64).toString('hex');
   return `${salt}:${hash}`;
};

// Utility function to verify passwords natively
const verifyPassword = (password: string, storedHash: string) => {
   const [salt, key] = storedHash.split(':');
   const hashBuffer = crypto.scryptSync(password, salt, 64);
   const keyBuffer = Buffer.from(key, 'hex');
   return crypto.timingSafeEqual(hashBuffer, keyBuffer);
};

// Generate a simple secure token for MVP
const generateToken = () => crypto.randomBytes(32).toString('hex');

router.post('/register', (req: Request, res: Response): any => {
  try {
     const { name, email, password } = req.body;
     
     if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
     }

     // Check if user already exists
     db.get('SELECT * FROM users WHERE email = ?', [email], (err, existingUser) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        if (existingUser) {
           return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password and insert
        const passwordHash = hashPassword(password);
        db.run(
           'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
           [name, email, passwordHash],
           function(err) {
              if (err) return res.status(500).json({ error: 'Database error' });
              
              const user = { id: this.lastID, name, email };
              const token = generateToken(); // Mock JWT for MVP
              
              return res.status(201).json({ user, token, message: 'User registered successfully' });
           }
        );
     });
  } catch (error) {
     console.error('Registration error:', error);
     return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', (req: Request, res: Response): any => {
  try {
     const { email, password } = req.body;

     if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
     }

     // Find user
     db.get('SELECT * FROM users WHERE email = ?', [email], (err, user: any) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        if (!user) {
           return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        if (!verifyPassword(password, user.password_hash)) {
           return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(); // Mock JWT for MVP

        return res.status(200).json({ 
           user: { id: user.id, name: user.name, email: user.email }, 
           token, 
           message: 'Login successful' 
        });
     });
  } catch (error) {
     console.error('Login error:', error);
     return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
