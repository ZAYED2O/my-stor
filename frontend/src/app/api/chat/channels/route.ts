import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    let query = supabase.from('ec_chat_channels').select('*');

    if (role === 'support') {
      query = query.in('type', ['customer_support', 'seller_support']);
    } else if (role === 'super_admin') {
      // Super admin sees all channels
    } else if (userId) {
      query = query.or(`creator_id.eq.${userId},participant_id.eq.${userId}`);
    } else {
      return NextResponse.json({ error: 'User ID or role is required' }, { status: 400 });
    }

    const { data: channels, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('Fetch channels error:', error.message);
      return NextResponse.json({ error: 'Could not fetch channels' }, { status: 500 });
    }

    return NextResponse.json({ channels: channels || [] }, { status: 200 });
  } catch (error) {
    console.error('GET channels error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, creator_id, participant_id, subject } = body;

    if (!type || !creator_id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Check if channel already exists to prevent duplicates for active chat session
    const { data: existing } = await supabase
      .from('ec_chat_channels')
      .select('*')
      .eq('type', type)
      .eq('creator_id', creator_id)
      .eq('status', 'open')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ channel: existing }, { status: 200 });
    }

    const { data: channel, error } = await supabase
      .from('ec_chat_channels')
      .insert([{
        type,
        creator_id,
        participant_id: participant_id || null,
        subject: subject || 'Chat Session',
        status: 'open'
      }])
      .select()
      .single();

    if (error) {
      console.error('Create channel error:', error.message);
      return NextResponse.json({ error: 'Could not create channel' }, { status: 500 });
    }

    return NextResponse.json({ channel }, { status: 201 });
  } catch (error) {
    console.error('POST channel error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { channelId, status, participant_id } = body;

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 });
    }

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (participant_id !== undefined) updates.participant_id = participant_id;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('ec_chat_channels')
      .update(updates)
      .eq('id', channelId);

    if (error) {
      console.error('Update channel error:', error.message);
      return NextResponse.json({ error: 'Could not update channel' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Channel updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('PATCH channel error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
