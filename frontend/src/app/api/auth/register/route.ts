import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ec_zayed_express_jwt_secret_2026';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('ec_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role: admin email gets super_admin, first user gets super_admin
    const { count } = await supabase.from('ec_users').select('*', { count: 'exact', head: true });
    const isFirstUser = (count ?? 0) === 0;
    const assignedRole = (isFirstUser || email === 'admin@zayed.com') ? 'super_admin' : 'customer';

    const userId = 'u-' + Date.now();
    const { data: newUser, error } = await supabase
      .from('ec_users')
      .insert([{
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
      }])
      .select('id, name, email, role')
      .single();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return NextResponse.json({ error: 'Could not create user' }, { status: 500 });
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
