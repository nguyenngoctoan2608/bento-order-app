'use client';

import { useState, useEffect } from 'react';
import { MenuItem } from '@/types';
import { useApp } from '@/context/AppContext';

interface AdminMenuManagerProps {
  onMenusUpdated: () => void;
}

export default function AdminMenuManager({ onMenusUpdated }: AdminMenuManagerProps) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showToast } = useApp();

  const load = () => fetch('/api/menus').then(r => r.json()).then(setMenus);

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim() || !newPrice) return;
    await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), price: Number(newPrice) }),
    });
    setNewName(''); setNewPrice(''); setShowForm(false);
    showToast('メニューを追加しました');
    await load(); onMenusUpdated();
  };

  const startEdit = (menu: MenuItem) => {
    setEditId(menu.id); setEditName(menu.name); setEditPrice(String(menu.price));
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    await fetch(`/api/menus/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), price: Number(editPrice) }),
    });
    setEditId(null);
    showToast('メニューを更新しました');
    await load(); onMenusUpdated();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/menus/${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    showToast('メニューを削除しました');
    await load(); onMenusUpdated();
  };

  return (
    <div className="flex flex-col gap-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-orange-500 text-white rounded-2xl py-3 font-bold shadow-md hover:bg-orange-600 transition-colors"
        >
          ＋ 新しいメニューを追加
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4">
          <h3 className="font-bold text-gray-800">新規メニュー追加</h3>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="メニュー名（例：Aセット）"
            className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-orange-400"
          />
          <input
            type="number"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            placeholder="価格（円）"
            className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-orange-400"
          />
          <div className="flex gap-3">
            <button onClick={handleAdd} className="flex-1 bg-orange-500 text-white rounded-xl py-3 font-bold hover:bg-orange-600 transition-colors">
              保存
            </button>
            <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 font-medium hover:bg-gray-50 transition-colors">
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">メニュー名</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">価格</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {menus.map(menu => (
              <tr key={menu.id} className="border-b border-gray-50 last:border-0 hover:bg-amber-50 transition-colors">
                <td className="px-4 py-3">
                  {editId === menu.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="border border-orange-300 rounded-lg px-2 py-1 text-sm w-full focus:outline-none"
                    />
                  ) : (
                    <span className="font-medium text-gray-800">{menu.name}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editId === menu.id ? (
                    <input
                      type="number"
                      value={editPrice}
                      onChange={e => setEditPrice(e.target.value)}
                      className="border border-orange-300 rounded-lg px-2 py-1 text-sm w-20 text-right focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-orange-500">¥{menu.price.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {editId === menu.id ? (
                      <>
                        <button onClick={handleSaveEdit} className="text-xs bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                          保存
                        </button>
                        <button onClick={() => setEditId(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                          取消
                        </button>
                      </>
                    ) : deleteConfirm === menu.id ? (
                      <>
                        <button onClick={() => handleDelete(menu.id)} className="text-xs bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600 transition-colors font-medium">
                          はい
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                          いいえ
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(menu)} className="text-xs bg-amber-50 text-amber-600 px-3 py-1 rounded-lg hover:bg-amber-100 transition-colors font-medium">
                          編集
                        </button>
                        <button onClick={() => setDeleteConfirm(menu.id)} className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                          削除
                        </button>
                      </>
                    )}
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
