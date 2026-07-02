import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    const { data: messages, error } = await supabase
      .from('ec_chat_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch messages error:', error.message);
      return NextResponse.json({ error: 'Could not fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] }, { status: 200 });
  } catch (error) {
    console.error('GET messages error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { channelId, senderId, senderName, senderRole, message, audioData } = body;

    if (!channelId || !senderId || !senderName || !senderRole) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { data: msg, error } = await supabase
      .from('ec_chat_messages')
      .insert([{
        channel_id: channelId,
        sender_id: senderId,
        sender_name: senderName,
        sender_role: senderRole,
        message: message || null,
        audio_data: audioData || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Create message error:', error.message);
      return NextResponse.json({ error: 'Could not create message' }, { status: 500 });
    }

    // Touch channel updated_at timestamp
    await supabase
      .from('ec_chat_channels')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', channelId);

    return NextResponse.json({ message: msg }, { status: 201 });
  } catch (error) {
    console.error('POST message error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
