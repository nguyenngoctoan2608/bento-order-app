'use client';

import { DailySummaryItem } from '@/types';

interface DailySummaryTableProps {
  data: DailySummaryItem[];
}

export default function DailySummaryTable({ data }: DailySummaryTableProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const recentData = data.filter(d => d.count > 0 || data.indexOf(d) >= data.length - 14);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <h3 className="font-bold text-gray-800 text-sm">日付別集計（過去30日）</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-4 py-2 text-gray-400 font-medium">日付</th>
              <th className="text-center px-4 py-2 text-gray-400 font-medium">件数</th>
              <th className="text-right px-4 py-2 text-gray-400 font-medium">売上</th>
              <th className="px-4 py-2 text-gray-400 font-medium w-24">割合</th>
            </tr>
          </thead>
          <tbody>
            {recentData.map(item => (
              <tr key={item.date} className="border-b border-gray-50 last:border-0 hover:bg-amber-50 transition-colors">
                <td className="px-4 py-2 text-gray-600 font-mono text-xs">{item.date}</td>
                <td className="px-4 py-2 text-center font-bold text-gray-800">{item.count}</td>
                <td className="px-4 py-2 text-right text-orange-500 font-medium">
                  {item.sales > 0 ? `¥${item.sales.toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-2">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full transition-all"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
