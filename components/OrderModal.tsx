'use client';

import { useState } from 'react';
import { MenuItem, Order } from '@/types';
import { useApp } from '@/context/AppContext';

interface OrderModalProps {
  menu: MenuItem;
  staffList: string[];
  deliveryDate: string;
  isNextDay: boolean;
  onConfirm: (order: Order) => void;
  onClose: () => void;
}

function formatDateJP(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${Number(m)}月${Number(d)}日`;
}

export default function OrderModal({ menu, staffList, deliveryDate, isNextDay, onConfirm, onClose }: OrderModalProps) {
  const [ordererName, setOrdererName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useApp();

  const handleConfirm = async () => {
    if (!ordererName.trim()) { setNameError(true); return; }
    setNameError(false);
    setSubmitting(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ordererName: ordererName.trim(),
        menuId: menu.id,
        menuName: menu.name,
        price: menu.price,
        deliveryDate,
      }),
    });
    if (res.ok) {
      const order = await res.json();
      showToast(isNextDay ? `${formatDateJP(deliveryDate)}分の注文が完了しました！` : '注文が完了しました！');
      onConfirm(order);
    } else {
      showToast('注文に失敗しました', 'warning');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
        <h2 className="text-xl font-bold text-gray-800 text-center">注文確認</h2>

        {isNextDay && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-center">
            <span className="text-orange-600 font-bold text-sm">📅 {formatDateJP(deliveryDate)}（翌日）のご注文</span>
          </div>
        )}

        <div className="bg-amber-50 rounded-2xl p-4 flex items-center justify-between">
          <span className="font-bold text-gray-800 text-lg">{menu.name}</span>
          {menu.price > 0 && (
            <span className="font-bold text-orange-500 text-xl">¥{menu.price.toLocaleString()}</span>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-2 font-medium">注文者名</label>
          <select
            value={ordererName}
            onChange={e => { setOrdererName(e.target.value); setNameError(false); }}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-orange-400 transition-colors"
          >
            <option value="">氏名を選択してください</option>
            {staffList.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          {nameError && <p className="text-amber-600 text-sm mt-1">注文者名を選択してください</p>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 bg-orange-500 text-white rounded-xl py-4 font-bold hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            {submitting ? '送信中...' : '確定する'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-4 font-medium hover:bg-gray-50 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}
