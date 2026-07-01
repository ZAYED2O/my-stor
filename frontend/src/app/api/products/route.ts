import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ec_products')
      .select('*')
      .order('createdAt', { ascending: true });

    if (error) {
      console.error('Supabase get products error:', error.message);
      return NextResponse.json({ error: 'Could not fetch products' }, { status: 500 });
    }

    const products = (data || []).map((p: any) => ({
      ...p,
      acceptedPayments: typeof p.acceptedPayments === 'string'
        ? JSON.parse(p.acceptedPayments)
        : p.acceptedPayments,
    }));

    return NextResponse.json({ products }, { status: 200 });

  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, category, image, seller, rating, acceptedPayments } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProduct = {
      id: 'prod-' + Date.now(),
      name,
      price,
      category,
      image: image || '📦',
      seller: seller || 'ZAYED EXPRESS',
      rating: rating || 5.0,
      acceptedPayments: JSON.stringify(acceptedPayments || ['card', 'cod', 'wallet']),
    };

    const { data, error } = await supabase
      .from('ec_products')
      .insert([newProduct])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert product error:', error.message);
      return NextResponse.json({ error: 'Could not add product' }, { status: 500 });
    }

    return NextResponse.json({
      product: { ...data, acceptedPayments: JSON.parse(data.acceptedPayments) }
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    if (updates.acceptedPayments && Array.isArray(updates.acceptedPayments)) {
      updates.acceptedPayments = JSON.stringify(updates.acceptedPayments);
    }

    const { error } = await supabase
      .from('ec_products')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Supabase update product error:', error.message);
      return NextResponse.json({ error: 'Could not update product' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('PATCH /api/products error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('ec_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete product error:', error.message);
      return NextResponse.json({ error: 'Could not delete product' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/products error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
