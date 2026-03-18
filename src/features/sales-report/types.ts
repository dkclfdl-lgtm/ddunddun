export interface ChannelData {
  channelName: string;
  sales: number;
  orders: number;
  salesDays: number;
}

export interface StoreChannelData {
  storeName: string;
  storeTag: string;
  openDate: string;
  channels: ChannelData[];
  totalSales: number;
  totalOrders: number;
  totalSalesDays: number;
}

export interface SalesReportData {
  period: string;
  stores: StoreChannelData[];
  channels: string[];
}

export interface ChannelSummary {
  channelName: string;
  totalSales: number;
  totalOrders: number;
  avgSalesPerStore: number;
  storeCount: number;
  salesRatio: number;
}

export interface TagSummary {
  tag: string;
  stores: string[];
  totalSales: number;
  totalOrders: number;
  avgSalesPerStore: number;
  salesRatio: number;
}

export interface StoreSummary {
  storeName: string;
  storeTag: string;
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  topChannel: string;
  topChannelSales: number;
}
