import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Get all customers/users
    const { data: users, error: usersError } = await supabase
      .from('ec_users')
      .select('id, name, email')
      .in('role', ['customer', 'user']);

    if (usersError) {
      console.error('Fetch users error:', usersError.message);
      return NextResponse.json({ error: 'Could not fetch customers list' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No customers to send broadcast to' }, { status: 200 });
    }

    // Send broadcast to all customers
    for (const u of users) {
      // Find or create an open support channel for this customer
      let channelId;
      
      const { data: existingChannel } = await supabase
        .from('ec_chat_channels')
        .select('id')
        .eq('type', 'customer_support')
        .eq('creator_id', u.id)
        .eq('status', 'open')
        .maybeSingle();

      if (existingChannel) {
        channelId = existingChannel.id;
      } else {
        const { data: newChannel, error: chanError } = await supabase
          .from('ec_chat_channels')
          .insert([{
            type: 'customer_support',
            creator_id: u.id,
            subject: 'Broadcast from Admin',
            status: 'open'
          }])
          .select('id')
          .single();

        if (chanError) {
          console.error(`Failed to create channel for user ${u.id}:`, chanError.message);
          continue; // Skip if fails
        }
        channelId = newChannel.id;
      }

      // Insert message
      await supabase
        .from('ec_chat_messages')
        .insert([{
          channel_id: channelId,
          sender_id: 'admin-001',
          sender_name: 'مدير النظام',
          sender_role: 'admin',
          message: message
        }]);

      // Update channel updated_at
      await supabase
        .from('ec_chat_channels')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', channelId);
    }

    return NextResponse.json({ message: `Broadcast successfully sent to ${users.length} customers` }, { status: 200 });

  } catch (error) {
    console.error('Broadcast POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
