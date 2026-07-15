import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { kv } from '@vercel/kv';
import { Order } from '@/types';
import { toLocalDateStr } from '@/lib/date';

// ===== 設定 =====
const PRICE_A = 450;
const PRICE_B = 420;

const MENU_LABEL: Record<string, string> = {
  '1': 'A',
  '2': '大',
  '3': 'B',
};

function getLabel(order: Order): string {
  return MENU_LABEL[order.menuId] ?? 'A';
}
function isTypeB(order: Order): boolean {
  return getLabel(order) === 'B';
}

function getMonthRange(now: Date): { start: Date; end: Date } {
  const day = now.getDate();
  if (day >= 16) {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 16),
      end:   new Date(now.getFullYear(), now.getMonth() + 1, 15),
    };
  }
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 16),
    end:   new Date(now.getFullYear(), now.getMonth(), 15),
  };
}

// 当月を含む3期分の期間を新しい順に返す
function getThreePeriods(now: Date): Array<{ start: Date; end: Date }> {
  const current = getMonthRange(now);
  const periods = [current];
  for (let i = 1; i < 3; i++) {
    const prev = periods[i - 1];
    const newEnd = new Date(prev.start);
    newEnd.setDate(newEnd.getDate() - 1);
    const newStart = new Date(prev.start);
    newStart.setMonth(newStart.getMonth() - 1);
    periods.push({ start: newStart, end: newEnd });
  }
  return periods;
}

function getWeekdays(start: Date, end: Date): string[] {
  const days: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) days.push(toLocalDateStr(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

// ===== スタイル定義 =====
const THIN: ExcelJS.BorderStyle = 'thin';
const MEDIUM: ExcelJS.BorderStyle = 'medium';

function border(
  top: ExcelJS.BorderStyle | null = THIN,
  right: ExcelJS.BorderStyle | null = THIN,
  bottom: ExcelJS.BorderStyle | null = THIN,
  left: ExcelJS.BorderStyle | null = THIN,
): Partial<ExcelJS.Borders> {
  const b: Partial<ExcelJS.Borders> = {};
  if (top)    b.top    = { style: top };
  if (right)  b.right  = { style: right };
  if (bottom) b.bottom = { style: bottom };
  if (left)   b.left   = { style: left };
  return b;
}

const COLOR_HEADER_A  = 'FFFDE68A';
const COLOR_HEADER_B  = 'FFBFDBFE';
const COLOR_TOTAL_ROW = 'FFFFE4C4';
const COLOR_TITLE     = 'FFFD7E14';

function fillSolid(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

const FONT_BASE: Partial<ExcelJS.Font>  = { name: 'Noto Sans JP', size: 10 };
const FONT_BOLD: Partial<ExcelJS.Font>  = { ...FONT_BASE, bold: true };
const FONT_TITLE: Partial<ExcelJS.Font> = { ...FONT_BOLD, size: 12, color: { argb: 'FFFFFFFF' } };

const ALIGN_CENTER: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true };
const ALIGN_RIGHT:  Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'right' };
const ALIGN_LEFT:   Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'left' };

// ===== 1シート分を構築する関数 =====
function buildSheet(
  wb: ExcelJS.Workbook,
  allOrders: Order[],
  allStaff: string[],
  start: Date,
  end: Date,
): void {
  const weekdays = getWeekdays(start, end);

  const periodOrders = allOrders.filter(o => {
    if (o.status === 'キャンセル済') return false;
    const d = new Date((o.deliveryDate ?? o.orderedAt.slice(0, 10)) + 'T00:00:00');
    return d >= start && d <= end;
  });

  // 日×社員 → ラベル
  const orderGrid = new Map<string, Map<string, string>>();
  weekdays.forEach(d => orderGrid.set(d, new Map()));
  periodOrders.forEach(o => {
    const d = o.deliveryDate ?? o.orderedAt.slice(0, 10);
    orderGrid.get(d)?.set(o.ordererName, getLabel(o));
  });

  // 日別集計
  const dayACount = new Map<string, number>(weekdays.map(d => [d, 0]));
  const dayBCount = new Map<string, number>(weekdays.map(d => [d, 0]));
  periodOrders.forEach(o => {
    const d = o.deliveryDate ?? o.orderedAt.slice(0, 10);
    if (!weekdays.includes(d)) return;
    if (isTypeB(o)) dayBCount.set(d, (dayBCount.get(d) ?? 0) + 1);
    else             dayACount.set(d, (dayACount.get(d) ?? 0) + 1);
  });

  // 社員別集計
  const staffACount = new Map<string, number>(allStaff.map(s => [s, 0]));
  const staffBCount = new Map<string, number>(allStaff.map(s => [s, 0]));
  periodOrders.forEach(o => {
    if (isTypeB(o)) staffBCount.set(o.ordererName, (staffBCount.get(o.ordererName) ?? 0) + 1);
    else             staffACount.set(o.ordererName, (staffACount.get(o.ordererName) ?? 0) + 1);
  });

  const totalA = [...dayACount.values()].reduce((s, n) => s + n, 0);
  const totalB = [...dayBCount.values()].reduce((s, n) => s + n, 0);

  // シート名は終了月（例：6/16〜7/15 → 7月集計）※ / はExcelシート名に使用不可
  const endMonth = end.getMonth() + 1;
  const sheetName = `${endMonth}月集計 (${start.getMonth() + 1}.${start.getDate()}〜${end.getMonth() + 1}.${end.getDate()})`;
  const ws = wb.addWorksheet(sheetName);

  const LAST_COL = 5 + weekdays.length;

  // 列幅
  ws.getColumn(1).width = 18;
  ws.getColumn(2).width = 7;
  ws.getColumn(3).width = 7;
  ws.getColumn(4).width = 7;
  ws.getColumn(5).width = 12;
  weekdays.forEach((_, i) => { ws.getColumn(6 + i).width = 6; });

  // Row1: タイトル（終了月を表示）
  const monthLabel = `${endMonth}月　${start.getMonth() + 1}/${start.getDate()}〜${end.getMonth() + 1}/${end.getDate()}　弁当注文集計`;
  const titleRow = ws.addRow([monthLabel]);
  ws.mergeCells(1, 1, 1, LAST_COL);
  titleRow.getCell(1).value = monthLabel;
  titleRow.getCell(1).font = FONT_TITLE;
  titleRow.getCell(1).fill = fillSolid(COLOR_TITLE);
  titleRow.getCell(1).alignment = ALIGN_CENTER;
  titleRow.getCell(1).border = border(MEDIUM, MEDIUM, MEDIUM, MEDIUM);
  titleRow.height = 24;

  // Row2: 列ヘッダー
  const headerValues: (string | number)[] = ['', '弁当A', '弁当B', '前月残', '金額合計'];
  weekdays.forEach(d => {
    const dt = new Date(d + 'T00:00:00');
    const dow = ['日', '月', '火', '水', '木', '金', '土'][dt.getDay()];
    headerValues.push(`${dt.getMonth() + 1}/${dt.getDate()}\n${dow}`);
  });
  const headerRow = ws.addRow(headerValues);
  headerRow.height = 30;
  headerRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    if (colNum > LAST_COL) return;
    cell.font = FONT_BOLD;
    cell.alignment = ALIGN_CENTER;
    cell.fill = fillSolid('FFFFE0B2');
    cell.border = border(MEDIUM, THIN, MEDIUM, colNum === 1 ? MEDIUM : THIN);
  });

  // Row3-8: 発注サマリー
  const summaryDefs = [
    { label: '弁当A', sub: '回数', color: COLOR_HEADER_A,
      values: weekdays.map(d => dayACount.get(d) ?? 0), total: totalA, isMoney: false },
    { label: '',      sub: '金額', color: COLOR_HEADER_A,
      values: weekdays.map(d => (dayACount.get(d) ?? 0) * PRICE_A), total: totalA * PRICE_A, isMoney: true },
    { label: '弁当B', sub: '回数', color: COLOR_HEADER_B,
      values: weekdays.map(d => dayBCount.get(d) ?? 0), total: totalB, isMoney: false },
    { label: '',      sub: '金額', color: COLOR_HEADER_B,
      values: weekdays.map(d => (dayBCount.get(d) ?? 0) * PRICE_B), total: totalB * PRICE_B, isMoney: true },
    { label: '合計',  sub: '回数', color: COLOR_TOTAL_ROW,
      values: weekdays.map(d => (dayACount.get(d) ?? 0) + (dayBCount.get(d) ?? 0)),
      total: totalA + totalB, isMoney: false },
    { label: '',      sub: '金額', color: COLOR_TOTAL_ROW,
      values: weekdays.map(d => (dayACount.get(d) ?? 0) * PRICE_A + (dayBCount.get(d) ?? 0) * PRICE_B),
      total: totalA * PRICE_A + totalB * PRICE_B, isMoney: true },
  ];

  summaryDefs.forEach((def, idx) => {
    const rowVals: (string | number)[] = [def.label, def.sub, '', '', def.total, ...def.values];
    const row = ws.addRow(rowVals);
    row.height = 18;
    const isBottomOfGroup = idx % 2 === 1;
    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      if (colNum > LAST_COL) return;
      cell.fill = fillSolid(def.color);
      cell.font = FONT_BASE;
      cell.alignment = colNum <= 2 ? ALIGN_CENTER : ALIGN_RIGHT;
      cell.border = border(
        THIN,
        colNum === LAST_COL ? MEDIUM : THIN,
        isBottomOfGroup ? MEDIUM : THIN,
        colNum === 1 ? MEDIUM : THIN,
      );
      if (def.isMoney && typeof cell.value === 'number') cell.numFmt = '¥#,##0';
    });
    if (def.label) row.getCell(1).font = FONT_BOLD;
  });

  // スペース行
  const spaceRow = ws.addRow([]);
  spaceRow.height = 6;

  // 社員ヘッダー行
  const staffHeaderVals: (string | number)[] = ['氏名', '弁当A', '弁当B', '前月残', '金額合計',
    ...weekdays.map(d => {
      const dt = new Date(d + 'T00:00:00');
      return `${dt.getMonth() + 1}/${dt.getDate()}`;
    })];
  const staffHeaderRow = ws.addRow(staffHeaderVals);
  staffHeaderRow.height = 22;
  staffHeaderRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    if (colNum > LAST_COL) return;
    cell.alignment = colNum === 1 ? ALIGN_LEFT : ALIGN_CENTER;
    cell.fill = fillSolid('FFFD7E14');
    cell.font = { ...FONT_BOLD, color: { argb: 'FFFFFFFF' } };
    cell.border = border(MEDIUM, colNum === LAST_COL ? MEDIUM : THIN, MEDIUM, colNum === 1 ? MEDIUM : THIN);
  });

  // 社員データ行
  allStaff.forEach((name, sIdx) => {
    const aCount = staffACount.get(name) ?? 0;
    const bCount = staffBCount.get(name) ?? 0;
    const total  = aCount * PRICE_A + bCount * PRICE_B;
    const isLastStaff = sIdx === allStaff.length - 1;

    const dailyVals = weekdays.map(d => orderGrid.get(d)?.get(name) ?? 0);
    const row = ws.addRow([name, aCount, bCount, 0, total, ...dailyVals]);
    row.height = 18;

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      if (colNum > LAST_COL) return;
      cell.fill = fillSolid(sIdx % 2 === 0 ? 'FFFFFFFF' : 'FFFFF7ED');
      cell.font = FONT_BASE;
      cell.alignment = colNum === 1 ? ALIGN_LEFT : ALIGN_CENTER;
      cell.border = border(
        THIN,
        colNum === LAST_COL ? MEDIUM : THIN,
        isLastStaff ? MEDIUM : THIN,
        colNum === 1 ? MEDIUM : THIN,
      );
      if (colNum >= 6 && cell.value !== 0 && cell.value !== '') {
        const v = String(cell.value);
        if (v === 'A' || v === '大') cell.fill = fillSolid('FFFDE68A');
        if (v === 'B')               cell.fill = fillSolid('FFBFDBFE');
      }
      if (colNum === 5 && typeof cell.value === 'number') cell.numFmt = '¥#,##0';
      if (cell.value === 0 && colNum >= 6) cell.value = '';
    });

    row.getCell(1).font = FONT_BOLD;
    if (aCount === 0) row.getCell(2).font = { ...FONT_BASE, color: { argb: 'FFAAAAAA' } };
    if (bCount === 0) row.getCell(3).font = { ...FONT_BASE, color: { argb: 'FFAAAAAA' } };
  });

  // 合計行
  const grandTotalA = allStaff.reduce((s, n) => s + (staffACount.get(n) ?? 0), 0);
  const grandTotalB = allStaff.reduce((s, n) => s + (staffBCount.get(n) ?? 0), 0);
  const grandTotal  = grandTotalA * PRICE_A + grandTotalB * PRICE_B;
  const totalRow = ws.addRow(['合計', grandTotalA, grandTotalB, '', grandTotal, ...weekdays.map(() => '')]);
  totalRow.height = 20;
  totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    if (colNum > LAST_COL) return;
    cell.fill = fillSolid(COLOR_TOTAL_ROW);
    cell.font = FONT_BOLD;
    cell.alignment = colNum === 1 ? ALIGN_LEFT : ALIGN_CENTER;
    cell.border = border(MEDIUM, colNum === LAST_COL ? MEDIUM : THIN, MEDIUM, colNum === 1 ? MEDIUM : THIN);
    if (colNum === 5 && typeof cell.value === 'number') cell.numFmt = '¥#,##0';
  });
}

// ===== エンドポイント =====
export async function GET() {
  const staffPath = path.join(process.cwd(), 'data', 'staff.json');

  let orders: Order[]    = [];
  let allStaff: string[] = [];
  try { orders = (await kv.get<Order[]>('orders')) ?? []; } catch { /* empty */ }
  try { allStaff = JSON.parse(await fs.readFile(staffPath, 'utf-8')); } catch { /* empty */ }

  const now = new Date();
  const periods = getThreePeriods(now);

  const wb = new ExcelJS.Workbook();
  // 直近3期分のシートを作成（新しい順）
  for (const { start, end } of periods) {
    buildSheet(wb, orders, allStaff, start, end);
  }

  const buffer = await wb.xlsx.writeBuffer();
  const { start } = periods[0];
  const periodKey = `${start.getFullYear()}${String(start.getMonth() + 1).padStart(2, '0')}`;
  const filename = `弁当注文集計_${periodKey}.xlsx`;

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
