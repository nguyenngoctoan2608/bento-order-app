import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';
import { Order, MenuItem, SummaryData } from '@/types';
import { toLocalDateStr, getBillingPeriod } from '@/lib/date';

const menusPath = path.join(process.cwd(), 'data', 'menus.json');
const staffPath = path.join(process.cwd(), 'data', 'staff.json');

async function readOrders(): Promise<Order[]> {
  try { return (await kv.get<Order[]>('orders')) ?? []; } catch { return []; }
}
async function readMenus(): Promise<MenuItem[]> {
  try { return JSON.parse(await fs.readFile(menusPath, 'utf-8')); } catch { return []; }
}
async function readStaff(): Promise<string[]> {
  try { return JSON.parse(await fs.readFile(staffPath, 'utf-8')); } catch { return []; }
}

function getDeliveryDate(o: Order): string {
  return o.deliveryDate ?? o.orderedAt.slice(0, 10);
}

function getMonthRange(now: Date): { start: Date; end: Date; label: string } {
  const { start, end } = getBillingPeriod(now);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return { start, end, label: `${fmt(start)}〜${fmt(end)}` };
}

export async function GET() {
  const [orders, menus, allStaff] = await Promise.all([readOrders(), readMenus(), readStaff()]);
  const now = new Date();
  const todayStr = toLocalDateStr(now);

  // 配達日ベースで本日分を集計
  const todayOrders = orders.filter(o => getDeliveryDate(o) === todayStr);
  const todayCount  = todayOrders.length;
  const todaySales  = todayOrders.reduce((s, o) => s + o.price, 0);
  const totalCount  = orders.length;
  const totalSales  = orders.reduce((s, o) => s + o.price, 0);

  // 過去30日の配達日別集計
  const dailyMap = new Map<string, { count: number; sales: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyMap.set(toLocalDateStr(d), { count: 0, sales: 0 });
  }
  orders.forEach(o => {
    const ds = getDeliveryDate(o);
    if (dailyMap.has(ds)) {
      const e = dailyMap.get(ds)!;
      e.count++;
      e.sales += o.price;
    }
  });
  const dailySummary = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));

  // メニュー別集計（本日・今月サイクル）
  const { start: monthStart, end: monthEnd, label: monthPeriod } = getMonthRange(now);
  const monthOrders = orders.filter(o => {
    const d = new Date(getDeliveryDate(o));
    return d >= monthStart && d <= monthEnd;
  });

  const menuMap = new Map(
    menus.map(m => [m.id, { menuId: m.id, menuName: m.name, todayCount: 0, monthCount: 0 }])
  );
  todayOrders.forEach(o => {
    if (!menuMap.has(o.menuId)) menuMap.set(o.menuId, { menuId: o.menuId, menuName: o.menuName, todayCount: 0, monthCount: 0 });
    menuMap.get(o.menuId)!.todayCount++;
  });
  monthOrders.forEach(o => {
    if (!menuMap.has(o.menuId)) menuMap.set(o.menuId, { menuId: o.menuId, menuName: o.menuName, todayCount: 0, monthCount: 0 });
    menuMap.get(o.menuId)!.monthCount++;
  });
  const menuSummary = Array.from(menuMap.values());

  // 社員別集計（本日配達分）
  const staffSummary = todayOrders.map(o => ({
    staffName: o.ordererName,
    menuName: o.menuName,
    status: o.status,
    orderedAt: o.orderedAt,
  }));

  // 社員別月次注文回数（全社員を含む、0回も表示）キャンセル済を除外
  const staffCountMap = new Map<string, number>(allStaff.map(s => [s, 0]));
  monthOrders.filter(o => o.status !== 'キャンセル済').forEach(o => {
    staffCountMap.set(o.ordererName, (staffCountMap.get(o.ordererName) ?? 0) + 1);
  });
  const staffMonthlyCount = Array.from(staffCountMap.entries())
    .map(([staffName, count]) => ({ staffName, count }))
    .sort((a, b) => b.count - a.count || a.staffName.localeCompare(b.staffName, 'ja'));

  const data: SummaryData = {
    todayCount, todaySales, totalCount, totalSales,
    monthPeriod,
    dailySummary, menuSummary, staffSummary,
    staffMonthlyCount,
  };
  return NextResponse.json(data);
}
