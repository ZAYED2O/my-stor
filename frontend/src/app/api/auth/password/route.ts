import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { email, name, oldPassword, newPassword } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('ec_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: any = {};

    if (name) {
      updates.name = name;
    }

    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json({ error: 'Old password is required to set new password' }, { status: 400 });
      }

      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Incorrect old password' }, { status: 401 });
      }

      updates.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('ec_users')
      .update(updates)
      .eq('email', email);

    if (updateError) {
      console.error('Update user error:', updateError.message);
      return NextResponse.json({ error: 'Could not update profile' }, { status: 500 });
    }

    // Fetch updated user to return
    const { data: updatedUser } = await supabase
      .from('ec_users')
      .select('id, name, email, role')
      .eq('email', email)
      .single();

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    console.error('PATCH /api/auth/password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
