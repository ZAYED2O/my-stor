import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all users
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ec_users')
      .select('id, name, email, role, createdAt')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Supabase get users error:', error.message);
      return NextResponse.json({ error: 'Could not fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users: data || [] }, { status: 200 });

  } catch (error) {
    console.error('GET /api/users error:', error);
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

    const { error } = await supabase
      .from('ec_users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Supabase update user role error:', error.message);
      return NextResponse.json({ error: 'Could not update user role' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User role updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('PATCH /api/users error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
