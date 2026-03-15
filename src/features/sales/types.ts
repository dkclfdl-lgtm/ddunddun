import type { DateRange } from '@/types';

export interface SalesDailyData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  cashSales: number;
  cardSales: number;
  dineIn: number;
  takeout: number;
  delivery: number;
}

export interface SalesHourlyData {
  hour: number;
  revenue: number;
  orders: number;
}

export interface SalesByMenuData {
  menuName: string;
  category: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

export interface SalesComparison {
  period: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface SalesTarget {
  month: string;
  targetRevenue: number;
  actualRevenue: number;
  achievementRate: number;
}

export interface SalesFilters {
  dateRange?: DateRange;
  storeId?: string;
  category?: string;
}

export interface ProductSalesData {
  productCode: string;
  productName: string;
  category: string;
  categoryCode: string;
  salesDays: number;
  orderCount: number;
  orderItems: number;
  orderQuantity: number;
  unitPrice: number;
  totalSalesAmount: number;
  cancelCount: number;
  cancelQuantity: number;
  cancelAmount: number;
  discountQuantity: number;
  discountAmount: number;
  actualSalesQty: number;
  actualUnitPrice: number;
  actualSalesAmount: number;
  supplyPrice: number;
  vat: number;
  netSalesAmount: number;
  paymentAmount: number;
  cashPayment: number;
  cardPayment: number;
  dineInOrders: number;
  dineInSales: number;
  takeoutOrders: number;
  takeoutSales: number;
  deliveryOrders: number;
  deliverySales: number;
  royaltyRate: number;
  royaltyAmount: number;
  normalSalesQty: number;
  serviceQuantity: number;
  returnQuantity: number;
  memberOrders: number;
  customerAverage: number;
  setQuantity: number;
  setAmount: number;
}

export interface SalesSimulation {
  productCode: string;
  productName: string;
  currentPrice: number;
  newPrice: number;
  currentQuantity: number;
  estimatedQuantity: number;
  currentRevenue: number;
  estimatedRevenue: number;
  revenueChange: number;
  recommendations: SimulationRecommendation[];
}

export interface SimulationRecommendation {
  type: 'price_optimization' | 'discount' | 'bundle' | 'time_based';
  title: string;
  description: string;
  impact: string;
}

export interface HeatmapData {
  day: number;
  hour: number;
  value: number;
}
