'use client';

import { SummaryData } from '@/types';

interface SummaryCardsProps {
  data: SummaryData;
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  const cards = [
    { label: '本日の注文件数', value: `${data.todayCount}件`, sub: null, color: 'text-orange-500' },
    { label: '本日の売上合計', value: `¥${data.todaySales.toLocaleString()}`, sub: null, color: 'text-orange-500' },
    { label: '累計注文件数', value: `${data.totalCount}件`, sub: null, color: 'text-gray-700' },
    { label: '累計売上', value: `¥${data.totalSales.toLocaleString()}`, sub: null, color: 'text-gray-700' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">{c.label}</p>
          <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
