'use client';

import { StaffSummaryItem, OrderStatus } from '@/types';

interface StaffSummaryTableProps {
  data: StaffSummaryItem[];
}

const statusStyles: Record<OrderStatus, string> = {
  受付済: 'bg-yellow-100 text-yellow-700',
  準備中: 'bg-orange-100 text-orange-600',
  完了: 'bg-green-100 text-green-600',
  キャンセル済: 'bg-gray-100 text-gray-400',
};

export default function StaffSummaryTable({ data }: StaffSummaryTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <h3 className="font-bold text-gray-800 text-sm">社員別集計（本日）</h3>
      </div>
      {data.length === 0 ? (
        <p className="text-center py-6 text-gray-400 text-sm">本日の注文なし</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-4 py-2 text-gray-400 font-medium">社員名</th>
              <th className="text-center px-4 py-2 text-gray-400 font-medium">メニュー</th>
              <th className="text-center px-4 py-2 text-gray-400 font-medium">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-amber-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{item.staffName}</td>
                <td className="px-4 py-3 text-center text-gray-600">{item.menuName}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[item.status]}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
