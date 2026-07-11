import * as XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(__dirname, '..', 'data', '昼食注文表_1.xlsx');

const staffNames = [
  '菱田 裕司', '山口 徹', '後藤 晃一郎', '林 政夫', '林 和之',
  '長谷川 伸之助', '吉澤 皓理', '宇藤 優希', '尾嵜 優', '藩 銘嘉',
  'TOAN', 'KHANG', 'LINH', 'ANH', 'THANG',
  '田原 みゆき', '長谷川 麻衣', '日置 純子', '北村 駿多', '杉山 正憲',
];

const headers = ['氏名', '通常弁当（A）', '通常弁当（A・ご飯大）', 'レディース弁当（B）'];

const rows = [headers, ...staffNames.map(name => [name, '', '', ''])];

const ws = XLSX.utils.aoa_to_sheet(rows);
ws['!cols'] = [{ wch: 20 }, { wch: 22 }, { wch: 24 }, { wch: 22 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, '昼食注文表');
XLSX.writeFile(wb, outputPath);

console.log('Excel file created:', outputPath);
