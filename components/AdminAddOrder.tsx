'use client';

import { useState, useEffect } from 'react';
import { MenuItem } from '@/types';
import { useApp } from '@/context/AppContext';
import { todayJST } from '@/lib/date';

function formatDateJP(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${Number(m)}月${Number(d)}日`;
}

export default function AdminAddOrder() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [staffList, setStaffList] = useState<string[]>([]);
  const [ordererName, setOrdererName] = useState('');
  const [menuId, setMenuId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(todayJST);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useApp();

  useEffect(() => {
    fetch('/api/menus').then(r => r.json()).then(setMenus);
    fetch('/api/staff').then(r => r.json()).then(setStaffList).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!ordererName || !menuId || !deliveryDate) return;
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;

    setSubmitting(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ordererName,
        menuId: menu.id,
        menuName: menu.name,
        price: menu.price,
        deliveryDate,
      }),
    });
    setSubmitting(false);

    if (res.ok) {
      showToast(`${ordererName}さんの${formatDateJP(deliveryDate)}分の注文を追加しました`);
      setOrdererName('');
      setMenuId('');
      setDeliveryDate(todayJST());
    } else {
      showToast('注文の追加に失敗しました', 'warning');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-gray-800">注文を代理追加</h3>
        <p className="text-xs text-gray-400 mt-1">締め切り(8:45)を過ぎてしまった場合など、管理者が代わりに注文を登録できます</p>
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-2 font-medium">注文者名</label>
        <select
          value={ordererName}
          onChange={e => setOrdererName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-orange-400 transition-colors"
        >
          <option value="">氏名を選択してください</option>
          {staffList.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-2 font-medium">メニュー</label>
        <select
          value={menuId}
          onChange={e => setMenuId(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-orange-400 transition-colors"
        >
          <option value="">メニューを選択してください</option>
          {menus.map(menu => (
            <option key={menu.id} value={menu.id}>{menu.name}（¥{menu.price.toLocaleString()}）</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-2 font-medium">お届け日</label>
        <input
          type="date"
          value={deliveryDate}
          onChange={e => setDeliveryDate(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-orange-400 transition-colors"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !ordererName || !menuId}
        className="bg-orange-500 text-white rounded-xl py-3 font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? '追加中...' : '注文を追加する'}
      </button>
    </div>
  );
}
