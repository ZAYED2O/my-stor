import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'users.json');

async function getDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
}

async function saveDb(db: any) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

// GET all users
export async function GET() {
  try {
    const db = await getDb();
    // In a real app we'd strip passwords, doing it here for safety
    const safeUsers = db.users.map((u: any) => ({
       id: u.id,
       name: u.name,
       email: u.email,
       role: u.role || 'customer',
       createdAt: u.createdAt
    }));
    return NextResponse.json({ users: safeUsers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// UPDATE user role
export async function PATCH(req: Request) {
   try {
      const body = await req.json();
      const { userId, newRole } = body;
  
      if (!userId || !newRole) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
      }
  
      const db = await getDb();
      const userIndex = db.users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
         return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      db.users[userIndex].role = newRole;
      await saveDb(db);
  
      return NextResponse.json({ message: 'User role updated successfully' }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
