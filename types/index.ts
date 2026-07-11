export type OrderStatus = '受付済' | '準備中' | '完了' | 'キャンセル済';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface Order {
  id: string;
  ordererName: string;
  menuId: string;
  menuName: string;
  price: number;
  status: OrderStatus;
  orderedAt: string;
  deliveryDate: string;
}

export interface SummaryData {
  todayCount: number;
  todaySales: number;
  totalCount: number;
  totalSales: number;
  monthPeriod: string;
  dailySummary: DailySummaryItem[];
  menuSummary: MenuSummaryItem[];
  staffSummary: StaffSummaryItem[];
  staffMonthlyCount: StaffMonthlyCountItem[];
}

export interface DailySummaryItem {
  date: string;
  count: number;
  sales: number;
}

export interface MenuSummaryItem {
  menuId: string;
  menuName: string;
  todayCount: number;
  monthCount: number;
}

export interface StaffSummaryItem {
  staffName: string;
  menuName: string;
  status: OrderStatus;
  orderedAt: string;
}

export interface StaffMonthlyCountItem {
  staffName: string;
  count: number;
}
