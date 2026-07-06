import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET support tickets mapped from ec_chat_channels/messages
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    let query = supabase
      .from('ec_chat_channels')
      .select('*')
      .eq('type', 'ticket')
      .order('created_at', { ascending: false });

    if (email) {
      query = query.eq('creator_id', email);
    }

    const { data: channels, error: channelsError } = await query;

    if (channelsError) {
      console.error('Fetch ticket channels error:', channelsError.message);
      return NextResponse.json({ error: 'Could not fetch tickets' }, { status: 500 });
    }

    const tickets = await Promise.all((channels || []).map(async (channel) => {
      const { data: messages, error: messagesError } = await supabase
        .from('ec_chat_messages')
        .select('*')
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error(`Fetch messages error for channel ${channel.id}:`, messagesError.message);
      }

      const customerMsg = messages?.find(m => m.sender_role === 'customer') || messages?.[0];
      const supportMsg = messages?.find(m => m.sender_role === 'support' || m.sender_role === 'admin');

      return {
        id: channel.id,
        customerEmail: channel.creator_id,
        subject: channel.subject || 'No Subject',
        message: customerMsg ? customerMsg.message : '',
        reply: supportMsg ? supportMsg.message : null,
        status: channel.status || 'Open',
        createdAt: channel.created_at
      };
    }));

    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error) {
    console.error('GET /api/support error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create support ticket mapped to ec_chat_channels/messages
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerEmail, subject, message } = body;

    if (!customerEmail || !subject || !message) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Create channel
    const { data: channel, error: channelError } = await supabase
      .from('ec_chat_channels')
      .insert([{
        type: 'ticket',
        creator_id: customerEmail,
        subject,
        status: 'Open'
      }])
      .select()
      .single();

    if (channelError) {
      console.error('Create ticket channel error:', channelError.message);
      return NextResponse.json({ error: 'Could not create ticket channel' }, { status: 500 });
    }

    // 2. Create initial message
    const { error: msgError } = await supabase
      .from('ec_chat_messages')
      .insert([{
        channel_id: channel.id,
        sender_id: customerEmail,
        sender_name: customerEmail,
        sender_role: 'customer',
        message
      }]);

    if (msgError) {
      console.error('Create ticket message error:', msgError.message);
      // Clean up the channel on failure
      await supabase.from('ec_chat_channels').delete().eq('id', channel.id);
      return NextResponse.json({ error: 'Could not create ticket message' }, { status: 500 });
    }

    const ticket = {
      id: channel.id,
      customerEmail,
      subject,
      message,
      reply: null,
      status: 'Open',
      createdAt: channel.created_at
    };

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('POST /api/support error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH reply/resolve support ticket (Admin)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, reply, status } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    // 1. Update channel status if provided
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    updates.updated_at = new Date().toISOString();

    const { error: channelError } = await supabase
      .from('ec_chat_channels')
      .update(updates)
      .eq('id', ticketId);

    if (channelError) {
      console.error('Update ticket channel error:', channelError.message);
      return NextResponse.json({ error: 'Could not update ticket channel status' }, { status: 500 });
    }

    // 2. Handle reply if provided
    if (reply !== undefined && reply !== null && reply.trim() !== '') {
      // Check if reply message exists from admin/support
      const { data: existingReplies, error: checkError } = await supabase
        .from('ec_chat_messages')
        .select('*')
        .eq('channel_id', ticketId)
        .in('sender_role', ['support', 'admin'])
        .limit(1);

      if (checkError) {
        console.error('Check existing reply error:', checkError.message);
      }

      if (existingReplies && existingReplies.length > 0) {
        // Update existing reply
        const { error: updateMsgError } = await supabase
          .from('ec_chat_messages')
          .update({ message: reply })
          .eq('id', existingReplies[0].id);

        if (updateMsgError) {
          console.error('Update reply message error:', updateMsgError.message);
          return NextResponse.json({ error: 'Could not update reply message' }, { status: 500 });
        }
      } else {
        // Insert new reply
        const { error: insertMsgError } = await supabase
          .from('ec_chat_messages')
          .insert([{
            channel_id: ticketId,
            sender_id: 'admin',
            sender_name: 'Support Agent',
            sender_role: 'admin',
            message: reply
          }]);

        if (insertMsgError) {
          console.error('Insert reply message error:', insertMsgError.message);
          return NextResponse.json({ error: 'Could not insert reply message' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ message: 'Ticket updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/support error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

