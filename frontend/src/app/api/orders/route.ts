import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'orders.json');

async function getDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty db
    return { orders: [] };
  }
}

async function saveDb(db: any) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerAddress, items, total, status } = body;

    if (!items || !total) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
    }

    const db = await getDb();
    
    const newOrder = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: customerName || 'Guest User',
      customerEmail: customerEmail || 'guest@zayed.com',
      customerAddress: customerAddress || 'No address provided',
      items,
      total,
      status: status || 'Pending',
      createdAt: new Date().toISOString()
    };

    db.orders.push(newOrder);
    await saveDb(db);

    return NextResponse.json({ 
      order: newOrder,
      message: 'Order created successfully'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
   try {
     const db = await getDb();
     
     // Sort orders by newest first
     const sortedOrders = db.orders.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
     );
 
     return NextResponse.json({ orders: sortedOrders }, { status: 200 });
   } catch (error) {
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
 
     const db = await getDb();
     const orderIndex = db.orders.findIndex((o: any) => o.id === orderId);
     
     if (orderIndex === -1) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
     }
 
     db.orders[orderIndex].status = newStatus;
     await saveDb(db);
 
     return NextResponse.json({ message: 'Order status updated successfully' }, { status: 200 });
   } catch (error) {
     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}
