import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerAddress, items, total, status } = body;

    if (!items || !total) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
    }

    const newOrder = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: customerName || 'Guest User',
      customerEmail: customerEmail || 'guest@zayed.com',
      customerAddress: customerAddress || 'No address provided',
      items: JSON.stringify(items),
      total,
      status: status || 'Pending',
    };

    const { data, error } = await supabase
      .from('ec_orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert order error:', error.message);
      return NextResponse.json({ error: 'Could not save order' }, { status: 500 });
    }

    return NextResponse.json({
      order: { ...data, items },
      message: 'Order created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ec_orders')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Supabase get orders error:', error.message);
      return NextResponse.json({ error: 'Could not fetch orders' }, { status: 500 });
    }

    // Parse items JSON string back to array
    const orders = (data || []).map((order: any) => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
    }));

    return NextResponse.json({ orders }, { status: 200 });

  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { error } = await supabase
      .from('ec_orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Supabase update order error:', error.message);
      return NextResponse.json({ error: 'Could not update order' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Order status updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('PATCH /api/orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
