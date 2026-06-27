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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { email, oldPassword, newPassword } = body;

    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = await getDb();
    const userIndex = db.users.findIndex((u: any) => u.email === email);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (db.users[userIndex].password !== oldPassword) {
      return NextResponse.json({ error: 'Incorrect old password' }, { status: 401 });
    }

    // Update password
    db.users[userIndex].password = newPassword;
    await saveDb(db);

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
