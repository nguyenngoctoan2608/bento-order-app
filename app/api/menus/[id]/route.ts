import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { MenuItem } from '@/types';

const dataPath = path.join(process.cwd(), 'data', 'menus.json');

async function readMenus(): Promise<MenuItem[]> {
  const raw = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(raw);
}

async function writeMenus(menus: MenuItem[]) {
  await fs.writeFile(dataPath, JSON.stringify(menus, null, 2), 'utf-8');
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const menus = await readMenus();
  const idx = menus.findIndex(m => m.id === id);
  if (idx === -1) return NextResponse.json({ error: '見つかりません' }, { status: 404 });
  menus[idx] = { ...menus[idx], ...body };
  await writeMenus(menus);
  return NextResponse.json(menus[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const menus = await readMenus();
  await writeMenus(menus.filter(m => m.id !== id));
  return NextResponse.json({ success: true });
}
