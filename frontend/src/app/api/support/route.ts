import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET support tickets
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    let query = supabase.from('ec_tickets').select('*').order('createdAt', { ascending: false });

    if (email) {
      query = query.eq('customerEmail', email);
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Fetch tickets error:', error.message);
      return NextResponse.json({ error: 'Could not fetch tickets' }, { status: 500 });
    }

    return NextResponse.json({ tickets: tickets || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create support ticket
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerEmail, subject, message } = body;

    if (!customerEmail || !subject || !message) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const ticketId = 'TCK-' + Math.floor(100000 + Math.random() * 900000);

    const { data: ticket, error } = await supabase
      .from('ec_tickets')
      .insert([{
        id: ticketId,
        customerEmail,
        subject,
        message,
        status: 'Open'
      }])
      .select()
      .single();

    if (error) {
      console.error('Create ticket error:', error.message);
      return NextResponse.json({ error: 'Could not create ticket' }, { status: 500 });
    }

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
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

    const updates: any = {};
    if (reply !== undefined) updates.reply = reply;
    if (status !== undefined) updates.status = status;

    const { error } = await supabase
      .from('ec_tickets')
      .update(updates)
      .eq('id', ticketId);

    if (error) {
      console.error('Update ticket error:', error.message);
      return NextResponse.json({ error: 'Could not update ticket' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Ticket updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
