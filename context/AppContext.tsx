'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { MenuItem, Order } from '@/types';

type MainTab = '注文' | '使い方' | '管理者';
type OrderView = 'select' | 'next-day' | 'complete' | 'history' | 'bulletin';
type AdminView = 'dashboard' | 'menus' | 'add-order';

interface ToastState { message: string; type: 'success' | 'warning' | 'info' }

interface AppContextType {
  mainTab: MainTab;
  setMainTab: (t: MainTab) => void;
  orderView: OrderView;
  setOrderView: (v: OrderView) => void;
  adminView: AdminView;
  setAdminView: (v: AdminView) => void;
  selectedMenu: MenuItem | null;
  setSelectedMenu: (m: MenuItem | null) => void;
  completedOrder: Order | null;
  setCompletedOrder: (o: Order | null) => void;
  toast: ToastState | null;
  showToast: (message: string, type?: ToastState['type']) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mainTab, setMainTab] = useState<MainTab>('注文');
  const [orderView, setOrderView] = useState<OrderView>('select');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <AppContext.Provider value={{
      mainTab, setMainTab,
      orderView, setOrderView,
      adminView, setAdminView,
      selectedMenu, setSelectedMenu,
      completedOrder, setCompletedOrder,
      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
