import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Order } from '@/types';
import { toLocalDateStr } from '@/lib/date';

async function readOrders(): Promise<Order[]> {
  try {
    return (await kv.get<Order[]>('orders')) ?? [];
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]) {
  await kv.set('orders', orders);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deliveryDate = searchParams.get('deliveryDate');
  let orders = await readOrders();
  if (deliveryDate) {
    orders = orders.filter(o => (o.deliveryDate ?? o.orderedAt.slice(0, 10)) === deliveryDate);
  }
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const orders = await readOrders();
  const num = orders.length + 1;
  const now = new Date();
  const newOrder: Order = {
    id: `ORD-${String(num).padStart(3, '0')}`,
    ordererName: body.ordererName,
    menuId: body.menuId,
    menuName: body.menuName,
    price: Number(body.price),
    status: '受付済',
    orderedAt: now.toISOString(),
    deliveryDate: body.deliveryDate ?? toLocalDateStr(now),
  };
  orders.push(newOrder);
  await writeOrders(orders);
  return NextResponse.json(newOrder, { status: 201 });
}
