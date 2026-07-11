import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Order } from '@/types';

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const orders = await readOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 });

  orders[idx] = { ...orders[idx], ...body };
  await writeOrders(orders);
  return NextResponse.json(orders[idx]);
}
