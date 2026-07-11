'use client';

import { useState, useEffect } from 'react';
import { SummaryData } from '@/types';
import SummaryCards from './SummaryCards';
import MenuSummaryTable from './MenuSummaryTable';
import StaffSummaryTable from './StaffSummaryTable';
import StaffMonthlyCountTable from './StaffMonthlyCountTable';

export default function AdminDashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch('/api/summary')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">読み込み中...</div>;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-700 text-sm">サマリーダッシュボード</h2>
        <button
          onClick={load}
          className="text-xs text-orange-500 border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-50 transition-colors"
        >
          更新
        </button>
      </div>
      <SummaryCards data={data} />
      <MenuSummaryTable data={data.menuSummary} monthPeriod={data.monthPeriod} />
      <StaffSummaryTable data={data.staffSummary} />
      <StaffMonthlyCountTable data={data.staffMonthlyCount} monthPeriod={data.monthPeriod} />
    </div>
  );
}
