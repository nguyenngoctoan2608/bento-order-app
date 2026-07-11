import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const FALLBACK_MENU_NAMES = ['Aセット', 'Bセット', 'ごはん大'];

export function readMenuNamesFromExcel(): string[] {
  const filePath = path.join(process.cwd(), 'data', '昼食注文表_1.xlsx');
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
    if (!data[0]) return FALLBACK_MENU_NAMES;
    // ヘッダー行の2列目以降がメニュー名
    const names = data[0].slice(1).filter(Boolean) as string[];
    return names.length > 0 ? names : FALLBACK_MENU_NAMES;
  } catch {
    return FALLBACK_MENU_NAMES;
  }
}

export function readStaffNamesFromExcel(): string[] {
  const filePath = path.join(process.cwd(), 'data', '昼食注文表_1.xlsx');
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
    // 1行目はヘッダー、2行目以降が社員名（1列目）
    return data.slice(1).map(row => row[0]).filter(Boolean) as string[];
  } catch {
    return [];
  }
}
