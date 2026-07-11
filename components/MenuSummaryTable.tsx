'use client';

import { MenuSummaryItem } from '@/types';

interface MenuSummaryTableProps {
  data: MenuSummaryItem[];
  monthPeriod: string;
}

export default function MenuSummaryTable({ data, monthPeriod }: MenuSummaryTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-baseline gap-2">
        <h3 className="font-bold text-gray-800 text-sm">メニュー別集計</h3>
        <span className="text-xs text-gray-400">（今月サイクル：{monthPeriod}）</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-50 bg-gray-50">
            <th className="text-left px-4 py-2 text-gray-400 font-medium">メニュー</th>
            <th className="text-center px-4 py-2 text-gray-400 font-medium">本日</th>
            <th className="text-center px-4 py-2 text-gray-400 font-medium">今月</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.menuId} className="border-b border-gray-50 last:border-0 hover:bg-amber-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{item.menuName}</td>
              <td className="px-4 py-3 text-center">
                <span className={`font-bold ${item.todayCount > 0 ? 'text-orange-500' : 'text-gray-300'}`}>
                  {item.todayCount}
                </span>
                <span className="text-gray-400 text-xs ml-1">件</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`font-bold ${item.monthCount > 0 ? 'text-gray-700' : 'text-gray-300'}`}>
                  {item.monthCount}
                </span>
                <span className="text-gray-400 text-xs ml-1">件</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
