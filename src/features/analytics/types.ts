export interface ExcelProductData {
  rowNum: number;
  categoryName: string;
  productCode: string;
  barcode: string | null;
  productAbCode: string;
  productName: string;
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
  salesQuantity: number;
  actualUnitPrice: number;
  actualSalesAmount: number;
  supplyPrice: number;
  vat: number;
  taxExemptAmount: number;
  totalDiscount: number;
  netSalesAmount: number;
  vatTruncation: number;
  finalSupplyPrice: number;
  finalVat: number;
  paymentAmount: number;
  cashPayment: number;
  cardPayment: number;
  creditPayment: number;
  couponPayment: number;
  agencyPayment: number;
  envFeeQuantity: number;
  envFeeAmount: number;
  dineInOrders: number;
  dineInQuantity: number;
  dineInSales: number;
  takeoutOrders: number;
  takeoutQuantity: number;
  takeoutSales: number;
  deliveryOrders: number;
  deliveryQuantity: number;
  deliverySales: number;
  royaltyRate: number;
  royaltyAmount: number;
  normalSalesQty: number;
  normalUnitPrice: number;
  normalSalesAmount: number;
  discountUnitPrice: number;
  serviceQuantity: number;
  serviceAmount: number;
  returnQuantity: number;
  returnAmount: number;
  serviceQuantity2: number;
  memberOrders: number;
  memberOrderCount: number;
  memberSalesAmount: number;
  customerAverage: number;
  firstCustomerAvg: number;
  secondCustomerAvg: number;
  orderLoc: number;
  mealTime: number;
  setQuantity: number;
  setAmount: number;
  courseQuantity: number;
  courseAmount: number;
  pointAmount: number;
  pointQuantity: number;
  categorySortOrder: number;
  productSortOrder: number;
  totalSalesDays: number;
  categoryCode: string;
}

export interface CategorySummary {
  categoryName: string;
  categoryCode: string;
  productCount: number;
  totalSalesAmount: number;
  totalQuantity: number;
  avgUnitPrice: number;
  totalOrders: number;
  cancelRate: number;
  dineInRatio: number;
  takeoutRatio: number;
  deliveryRatio: number;
  memberRatio: number;
}

export interface PeriodComparison {
  period: string;
  label: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  topProduct: string;
  growthRate: number;
}

export interface PriceSimulation {
  productCode: string;
  productName: string;
  currentPrice: number;
  currentQuantity: number;
  currentRevenue: number;
  newPrice: number;
  priceChangePercent: number;
  elasticity: number;
  estimatedQuantity: number;
  estimatedRevenue: number;
  revenueChange: number;
  revenueChangePercent: number;
  profitImpact: number;
}

export interface ProductRecommendation {
  type: 'price_increase' | 'price_decrease' | 'promotion' | 'bundle' | 'discontinue' | 'premium';
  productCode: string;
  productName: string;
  currentMetric: number;
  suggestedAction: string;
  expectedImpact: string;
  confidence: number;
  reason: string;
}

export interface ColumnConfig {
  key: string;
  label: string;
  group: string;
  isVisible: boolean;
  width: number;
  format: 'text' | 'number' | 'currency' | 'percent' | 'date';
}

export interface AnalyticsFilters {
  categories: string[];
  searchProduct: string;
  minSalesAmount: number;
  maxSalesAmount: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  comparisonPeriod: 'monthly' | 'weekly' | 'daily';
}
