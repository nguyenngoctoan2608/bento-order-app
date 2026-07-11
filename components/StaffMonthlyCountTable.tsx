'use client';

import { StaffMonthlyCountItem } from '@/types';

interface Props {
  data: StaffMonthlyCountItem[];
  monthPeriod: string;
}

export default function StaffMonthlyCountTable({ data, monthPeriod }: Props) {
  const totalOrders = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">社員別注文回数</h3>
          <p className="text-xs text-gray-400 mt-0.5">集計期間：{monthPeriod}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            合計 <span className="font-bold text-gray-700">{totalOrders}</span> 件
          </span>
          <a
            href="/api/export/monthly"
            download
            className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-full font-medium hover:bg-green-600 transition-colors"
          >
            📥 Excelダウンロード
          </a>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50">
              <th className="text-left px-4 py-2 text-gray-400 font-medium w-8">#</th>
              <th className="text-left px-4 py-2 text-gray-400 font-medium">氏名</th>
              <th className="text-center px-4 py-2 text-gray-400 font-medium w-24">合計注文回数</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr
                key={item.staffName}
                className={`border-b border-gray-50 last:border-0 transition-colors
                  ${item.count === 0 ? 'opacity-40' : 'hover:bg-amber-50'}`}
              >
                <td className="px-4 py-2.5 text-xs text-gray-300 font-mono">{i + 1}</td>
                <td className="px-4 py-2.5 font-medium text-gray-800">{item.staffName}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`font-bold text-lg ${item.count > 0 ? 'text-orange-500' : 'text-gray-300'}`}>
                    {item.count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
