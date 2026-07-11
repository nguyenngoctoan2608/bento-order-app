import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { MenuItem } from '@/types';
import { readMenuNamesFromExcel } from '@/lib/excel';

const dataPath = path.join(process.cwd(), 'data', 'menus.json');

async function readMenus(): Promise<MenuItem[]> {
  try {
    const raw = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeMenus(menus: MenuItem[]) {
  await fs.writeFile(dataPath, JSON.stringify(menus, null, 2), 'utf-8');
}

export async function GET() {
  let menus = await readMenus();
  if (menus.length === 0) {
    const names = readMenuNamesFromExcel();
    menus = names.map((name, i) => ({
      id: String(i + 1),
      name,
      price: 0,
      available: true,
    }));
    await writeMenus(menus);
  }
  return NextResponse.json(menus);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const menus = await readMenus();
  const newMenu: MenuItem = {
    id: Date.now().toString(),
    name: body.name,
    price: Number(body.price ?? 0),
    available: true,
  };
  menus.push(newMenu);
  await writeMenus(menus);
  return NextResponse.json(newMenu, { status: 201 });
}
