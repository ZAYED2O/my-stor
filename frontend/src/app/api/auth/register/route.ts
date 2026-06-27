import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'users.json');

async function getDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty db
    return { users: [] };
  }
}

async function saveDb(db: any) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const db = await getDb();
    
    if (db.users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const isFirstUser = db.users.length === 0;
    const assignedRole = isFirstUser || email === 'admin@zayed.com' ? 'super_admin' : 'customer';

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // Note: In a real production app, always hash passwords! This is an MVP using a JSON file.
      role: assignedRole,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await saveDb(db);

    return NextResponse.json({ 
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      token: 'jwt-mock-token-' + newUser.id 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
