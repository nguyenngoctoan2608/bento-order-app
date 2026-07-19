'use client';

import { useState, useEffect } from 'react';
import { MenuItem, Order } from '@/types';
import { useApp } from '@/context/AppContext';
import MenuSelector from '@/components/MenuSelector';
import CountdownTimer from '@/components/CountdownTimer';
import OrderModal from '@/components/OrderModal';
import OrderHistory from '@/components/OrderHistory';
import BulletinBoard from '@/components/BulletinBoard';
import Toast from '@/components/Toast';
import AdminDashboard from '@/components/AdminDashboard';
import AdminMenuManager from '@/components/AdminMenuManager';
import UsageGuide from '@/components/UsageGuide';
import AdminGuard from '@/components/AdminGuard';
import { todayJST, nextBusinessDayJST } from '@/lib/date';

function getNextDay(): string {
  return nextBusinessDayJST();
}

function getTodayStr(): string {
  return todayJST();
}

function isDeadlinePassed(): boolean {
  const now = new Date();
  const deadline = new Date(now);
  deadline.setHours(8, 45, 0, 0);
  return now >= deadline;
}

export default function Page() {
  const {
    mainTab, setMainTab,
    orderView, setOrderView,
    adminView, setAdminView,
    selectedMenu, setSelectedMenu,
    completedOrder, setCompletedOrder,
    showToast,
  } = useApp();

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [staffList, setStaffList] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deadlinePassed, setDeadlinePassed] = useState(isDeadlinePassed);
  const [today, setToday] = useState(getTodayStr);

  useEffect(() => {
    fetch('/api/menus').then(r => r.json()).then(setMenus);
    fetch('/api/staff').then(r => r.json()).then(setStaffList).catch(() => {});

    if (isDeadlinePassed()) {
      setDeadlinePassed(true);
      setOrderView('bulletin');
    }
  }, []);

  // タブを開きっぱなしのまま日付が変わった場合、締め切り状態を
  // 新しい日に合わせて再判定する（古い「翌日注文」状態のまま
  // 新しい日の注文が翌々日扱いになるのを防ぐ）
  useEffect(() => {
    const id = setInterval(() => {
      const nowToday = getTodayStr();
      if (nowToday !== today) {
        setToday(nowToday);
        const passed = isDeadlinePassed();
        setDeadlinePassed(passed);
        if (orderView === 'next-day' || orderView === 'bulletin') {
          setOrderView(passed ? 'bulletin' : 'select');
        }
      }
    }, 30000);
    return () => clearInterval(id);
  }, [today, orderView, setOrderView]);

  const handleDeadlineExpired = () => {
    setDeadlinePassed(true);
    setOrderView('bulletin');
    setSelectedMenu(null);
    setShowModal(false);
  };

  const handleOrderConfirm = (order: Order) => {
    setShowModal(false);
    setCompletedOrder(order);
    setSelectedMenu(null);
    setOrderView('complete');
  };

  const handleOrderAgain = () => {
    setCompletedOrder(null);
    setOrderView(deadlinePassed ? 'next-day' : 'select');
  };

  const isNextDayMode = orderView === 'next-day';
  const deliveryDate  = isNextDayMode ? getNextDay() : getTodayStr();

  function formatDateJP(dateStr: string) {
    const [, m, d] = dateStr.split('-');
    return `${Number(m)}月${Number(d)}日`;
  }

  // サブタブ定義
  const orderSubTabs = [
    { key: 'select'   as const, label: '本日注文',     hide: deadlinePassed },
    { key: 'next-day' as const, label: `翌日注文（${formatDateJP(getNextDay())}）`, hide: !deadlinePassed },
    { key: 'bulletin' as const, label: '掲示用リスト', hide: false },
    { key: 'complete' as const, label: '注文完了',     hide: !completedOrder },
    { key: 'history'  as const, label: '注文履歴',     hide: false },
  ];

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Toast />

      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <span className="text-2xl">🍱</span>
          <h1 className="text-lg font-bold text-gray-800">お弁当注文</h1>
        </div>
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex border-b border-gray-100">
            {(['注文', '使い方', '管理者'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setMainTab(tab)}
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 -mb-px
                  ${mainTab === tab ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">

        {/* ===== 注文タブ ===== */}
        {mainTab === '注文' && (
          <div>
            {/* サブタブ */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide print:hidden">
              {orderSubTabs.filter(t => !t.hide).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setOrderView(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0
                    ${orderView === tab.key
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-300'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 本日注文 */}
            {orderView === 'select' && (
              <div className="flex flex-col gap-5">
                <CountdownTimer onExpired={handleDeadlineExpired} />
                <MenuSelector menus={menus} disabled={false} />
                <button
                  onClick={() => {
                    if (!selectedMenu) { showToast('メニューを選択してください', 'warning'); return; }
                    setShowModal(true);
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-lg shadow-md bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-0.5 transition-all"
                >
                  注文する
                </button>
              </div>
            )}

            {/* 翌日注文 */}
            {orderView === 'next-day' && (
              <div className="flex flex-col gap-5">
                <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 text-center">
                  <p className="text-orange-600 font-bold">📅 {formatDateJP(getNextDay())}（翌日）の注文受付中</p>
                  <p className="text-xs text-orange-400 mt-1">本日の締め切り（8:45）を過ぎたため、翌日分の注文を受け付けています</p>
                </div>
                <MenuSelector menus={menus} disabled={false} />
                <button
                  onClick={() => {
                    if (!selectedMenu) { showToast('メニューを選択してください', 'warning'); return; }
                    setShowModal(true);
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-lg shadow-md bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-0.5 transition-all"
                >
                  翌日分を注文する
                </button>
              </div>
            )}

            {/* 掲示用リスト */}
            {orderView === 'bulletin' && (
              <div className="flex flex-col gap-4">
                {deadlinePassed && (
                  <div className="bg-amber-100 border border-amber-300 rounded-2xl px-5 py-3 text-center">
                    <p className="text-amber-700 font-bold text-sm">本日の注文は締め切りました（AM8:45）</p>
                  </div>
                )}
                <BulletinBoard />
              </div>
            )}

            {/* 注文完了 */}
            {orderView === 'complete' && completedOrder && (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">✅</div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">注文が完了しました！</h2>
                  <p className="text-gray-500 text-sm">{completedOrder.ordererName} さんの注文を受け付けました</p>
                  {completedOrder.deliveryDate !== getTodayStr() && (
                    <p className="text-orange-500 text-sm font-medium mt-1">
                      📅 お届け日：{formatDateJP(completedOrder.deliveryDate)}
                    </p>
                  )}
                </div>
                <div className="bg-amber-50 rounded-2xl p-5 w-full space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">注文番号</span>
                    <span className="font-bold font-mono text-gray-800">{completedOrder.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">注文者</span>
                    <span className="font-medium text-gray-800">{completedOrder.ordererName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">メニュー</span>
                    <span className="font-medium text-gray-800">{completedOrder.menuName}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={handleOrderAgain}
                    className="w-full bg-orange-500 text-white rounded-2xl py-3 font-bold hover:bg-orange-600 transition-colors"
                  >
                    続けて注文する
                  </button>
                  <button
                    onClick={() => setOrderView('bulletin')}
                    className="w-full border border-gray-200 text-gray-600 rounded-2xl py-3 font-medium hover:bg-gray-50 transition-colors"
                  >
                    掲示用リストを見る
                  </button>
                  <button
                    onClick={() => setOrderView('history')}
                    className="w-full border border-gray-200 text-gray-600 rounded-2xl py-3 font-medium hover:bg-gray-50 transition-colors"
                  >
                    注文履歴を見る
                  </button>
                </div>
              </div>
            )}

            {/* 注文履歴 */}
            {orderView === 'history' && <OrderHistory />}
          </div>
        )}

        {/* ===== 使い方タブ ===== */}
        {mainTab === '使い方' && <UsageGuide />}

        {/* ===== 管理者タブ ===== */}
        {mainTab === '管理者' && (
          <AdminGuard>
            <div className="flex gap-2 mb-5">
              {(['dashboard', 'menus'] as const).map(view => {
                const labels = { dashboard: 'ダッシュボード', menus: 'メニュー管理' };
                return (
                  <button
                    key={view}
                    onClick={() => setAdminView(view)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all
                      ${adminView === view ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-300'}`}
                  >
                    {labels[view]}
                  </button>
                );
              })}
            </div>
            {adminView === 'dashboard' && <AdminDashboard />}
            {adminView === 'menus' && <AdminMenuManager onMenusUpdated={() => fetch('/api/menus').then(r => r.json()).then(setMenus)} />}
          </AdminGuard>
        )}
      </main>

      {showModal && selectedMenu && (
        <OrderModal
          menu={selectedMenu}
          staffList={staffList}
          deliveryDate={deliveryDate}
          isNextDay={isNextDayMode}
          onConfirm={handleOrderConfirm}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
