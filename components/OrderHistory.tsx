'use client';

import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { useApp } from '@/context/AppContext';

const statusStyles: Record<OrderStatus, string> = {
  受付済: 'bg-yellow-100 text-yellow-700',
  準備中: 'bg-orange-100 text-orange-600',
  完了: 'bg-green-100 text-green-600',
  キャンセル済: 'bg-gray-100 text-gray-400',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { showToast } = useApp();

  const load = () => {
    fetch('/api/orders')
      .then(r => r.json())
      .then((data: Order[]) => { setOrders([...data].reverse()); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (order: Order) => {
    if (order.status !== '受付済') return;
    setCancellingId(order.id);
    const res = await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'キャンセル済' }),
    });
    if (res.ok) {
      showToast('注文をキャンセルしました', 'info');
      load();
    } else {
      showToast('キャンセルに失敗しました', 'warning');
    }
    setCancellingId(null);
  };

  if (loading) return <div className="text-center py-8 text-gray-400">読み込み中...</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <span className="text-4xl block mb-2">📋</span>
        注文履歴がありません
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map(order => {
        const date = new Date(order.orderedAt);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        const isCancelled = order.status === 'キャンセル済';
        const canCancel = order.status === '受付済';

        return (
          <div
            key={order.id}
            className={`bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 ${isCancelled ? 'opacity-50' : ''}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`font-bold ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {order.ordererName}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <p className={`text-sm ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                {order.menuName}
              </p>
              <p className="text-xs text-gray-400 mt-1">{dateStr} ／ {order.id}</p>
            </div>
            {canCancel && (
              <button
                onClick={() => handleCancel(order)}
                disabled={cancellingId === order.id}
                className="text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-xl hover:border-amber-400 hover:text-amber-600 transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                {cancellingId === order.id ? '処理中...' : 'キャンセル'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
