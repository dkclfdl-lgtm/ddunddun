import { format, subDays } from 'date-fns';
import type {
  SalesDailyData,
  SalesHourlyData,
  SalesByMenuData,
  SalesComparison,
  SalesTarget,
  ProductSalesData,
  HeatmapData,
} from './types';

const today = new Date('2026-03-15');

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() + (max - min) * 0.5 + min);
}

function generateDailySales(): SalesDailyData[] {
  const data: SalesDailyData[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFriday = dayOfWeek === 5;
    const baseRevenue = isWeekend ? 3200000 : isFriday ? 2800000 : 2100000;
    const variance = baseRevenue * 0.15;
    const revenue = Math.round(baseRevenue + (Math.random() - 0.5) * 2 * variance);
    const orders = Math.round(revenue / (isWeekend ? 28000 : 25000));
    const avgOrderValue = Math.round(revenue / orders);
    const cardRatio = 0.72 + Math.random() * 0.1;
    const cardSales = Math.round(revenue * cardRatio);
    const cashSales = revenue - cardSales;
    const dineInRatio = 0.55 + Math.random() * 0.1;
    const takeoutRatio = 0.15 + Math.random() * 0.05;
    const dineIn = Math.round(revenue * dineInRatio);
    const takeout = Math.round(revenue * takeoutRatio);
    const delivery = revenue - dineIn - takeout;

    data.push({
      date: format(date, 'yyyy-MM-dd'),
      revenue,
      orders,
      avgOrderValue,
      cashSales,
      cardSales,
      dineIn,
      takeout,
      delivery,
    });
  }
  return data;
}

function generateHourlySales(): SalesHourlyData[] {
  const hourlyPattern = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.02, 0.08,
    0.12, 0.08, 0.04, 0.03, 0.05, 0.1, 0.15, 0.13,
    0.1, 0.06, 0.03, 0.01,
  ];
  const totalDayRevenue = 2500000;
  return hourlyPattern.map((ratio, hour) => {
    const revenue = Math.round(totalDayRevenue * ratio);
    const orders = revenue > 0 ? Math.round(revenue / 26000) || 1 : 0;
    return { hour, revenue, orders };
  });
}

const menuCategories = ['주류', '튀김', '음료', '탕', '치킨', '안주', '사이드', '식사', '디저트'];

function generateMenuSales(): SalesByMenuData[] {
  const items: SalesByMenuData[] = [
    { menuName: '참이슬', category: '주류', quantity: 1820, revenue: 9100000, percentage: 0 },
    { menuName: '살얼음맥주500cc', category: '주류', quantity: 1540, revenue: 8470000, percentage: 0 },
    { menuName: '카스', category: '주류', quantity: 1380, revenue: 6900000, percentage: 0 },
    { menuName: '처음처럼', category: '주류', quantity: 1150, revenue: 5750000, percentage: 0 },
    { menuName: '테라', category: '주류', quantity: 980, revenue: 4900000, percentage: 0 },
    { menuName: '하이볼', category: '주류', quantity: 720, revenue: 5760000, percentage: 0 },
    { menuName: '순살치킨', category: '치킨', quantity: 650, revenue: 11050000, percentage: 0 },
    { menuName: '양념치킨', category: '치킨', quantity: 580, revenue: 9860000, percentage: 0 },
    { menuName: '후라이드치킨', category: '치킨', quantity: 520, revenue: 8320000, percentage: 0 },
    { menuName: '닭강정', category: '치킨', quantity: 380, revenue: 5700000, percentage: 0 },
    { menuName: '모둠튀김', category: '튀김', quantity: 620, revenue: 5580000, percentage: 0 },
    { menuName: '새우튀김', category: '튀김', quantity: 450, revenue: 4050000, percentage: 0 },
    { menuName: '오징어튀김', category: '튀김', quantity: 380, revenue: 3040000, percentage: 0 },
    { menuName: '감자튀김', category: '튀김', quantity: 520, revenue: 3640000, percentage: 0 },
    { menuName: '김치찌개', category: '탕', quantity: 340, revenue: 2720000, percentage: 0 },
    { menuName: '부대찌개', category: '탕', quantity: 280, revenue: 3080000, percentage: 0 },
    { menuName: '순두부찌개', category: '탕', quantity: 220, revenue: 1760000, percentage: 0 },
    { menuName: '콜라', category: '음료', quantity: 850, revenue: 2550000, percentage: 0 },
    { menuName: '사이다', category: '음료', quantity: 680, revenue: 2040000, percentage: 0 },
    { menuName: '제로콜라', category: '음료', quantity: 520, revenue: 1560000, percentage: 0 },
    { menuName: '두부김치', category: '안주', quantity: 420, revenue: 5040000, percentage: 0 },
    { menuName: '골뱅이소면', category: '안주', quantity: 350, revenue: 4550000, percentage: 0 },
    { menuName: '계란말이', category: '사이드', quantity: 480, revenue: 3360000, percentage: 0 },
    { menuName: '주먹밥', category: '식사', quantity: 320, revenue: 1920000, percentage: 0 },
    { menuName: '볶음밥', category: '식사', quantity: 280, revenue: 2240000, percentage: 0 },
  ];

  const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
  return items.map((item) => ({
    ...item,
    percentage: Number(((item.revenue / totalRevenue) * 100).toFixed(1)),
  }));
}

function generateSalesComparison(): SalesComparison[] {
  return [
    { period: '1월', current: 68500000, previous: 62300000, change: 6200000, changePercent: 9.95 },
    { period: '2월', current: 62100000, previous: 58700000, change: 3400000, changePercent: 5.79 },
    { period: '3월', current: 71200000, previous: 65800000, change: 5400000, changePercent: 8.21 },
    { period: '4월', current: 0, previous: 69200000, change: -69200000, changePercent: -100 },
    { period: '5월', current: 0, previous: 72100000, change: -72100000, changePercent: -100 },
    { period: '6월', current: 0, previous: 74500000, change: -74500000, changePercent: -100 },
    { period: '7월', current: 0, previous: 78900000, change: -78900000, changePercent: -100 },
    { period: '8월', current: 0, previous: 81200000, change: -81200000, changePercent: -100 },
    { period: '9월', current: 0, previous: 73400000, change: -73400000, changePercent: -100 },
    { period: '10월', current: 0, previous: 70800000, change: -70800000, changePercent: -100 },
    { period: '11월', current: 0, previous: 67500000, change: -67500000, changePercent: -100 },
    { period: '12월', current: 0, previous: 75200000, change: -75200000, changePercent: -100 },
  ];
}

function generateSalesTargets(): SalesTarget[] {
  return [
    { month: '2026-01', targetRevenue: 70000000, actualRevenue: 68500000, achievementRate: 97.9 },
    { month: '2026-02', targetRevenue: 65000000, actualRevenue: 62100000, achievementRate: 95.5 },
    { month: '2026-03', targetRevenue: 75000000, actualRevenue: 71200000, achievementRate: 94.9 },
    { month: '2026-04', targetRevenue: 72000000, actualRevenue: 0, achievementRate: 0 },
    { month: '2026-05', targetRevenue: 73000000, actualRevenue: 0, achievementRate: 0 },
    { month: '2026-06', targetRevenue: 76000000, actualRevenue: 0, achievementRate: 0 },
  ];
}

function generateProductSalesData(): ProductSalesData[] {
  const products: ProductSalesData[] = [
    {
      productCode: 'P001', productName: '참이슬', category: '주류', categoryCode: 'C01',
      salesDays: 30, orderCount: 1820, orderItems: 1820, orderQuantity: 3640,
      unitPrice: 5000, totalSalesAmount: 9100000,
      cancelCount: 12, cancelQuantity: 24, cancelAmount: 60000,
      discountQuantity: 85, discountAmount: 212500,
      actualSalesQty: 3531, actualUnitPrice: 4950, actualSalesAmount: 8827500,
      supplyPrice: 8025000, vat: 802500, netSalesAmount: 8025000,
      paymentAmount: 8827500, cashPayment: 2207000, cardPayment: 6620500,
      dineInOrders: 1200, dineInSales: 6000000, takeoutOrders: 320, takeoutSales: 1600000,
      deliveryOrders: 300, deliveryOrders2: 1500000, deliverySales: 1500000,
      royaltyRate: 3, royaltyAmount: 240750,
      normalSalesQty: 3440, serviceQuantity: 91, returnQuantity: 24,
      memberOrders: 980, customerAverage: 5000, setQuantity: 0, setAmount: 0,
    } as ProductSalesData,
    {
      productCode: 'P002', productName: '살얼음맥주500cc', category: '주류', categoryCode: 'C01',
      salesDays: 30, orderCount: 1540, orderItems: 1540, orderQuantity: 2310,
      unitPrice: 5500, totalSalesAmount: 8470000,
      cancelCount: 8, cancelQuantity: 12, cancelAmount: 33000,
      discountQuantity: 62, discountAmount: 170500,
      actualSalesQty: 2236, actualUnitPrice: 5450, actualSalesAmount: 8266500,
      supplyPrice: 7515000, vat: 751500, netSalesAmount: 7515000,
      paymentAmount: 8266500, cashPayment: 1653300, cardPayment: 6613200,
      dineInOrders: 1100, dineInSales: 6050000, takeoutOrders: 220, takeoutSales: 1210000,
      deliveryOrders: 220, deliverySales: 1210000,
      royaltyRate: 3, royaltyAmount: 225450,
      normalSalesQty: 2180, serviceQuantity: 56, returnQuantity: 12,
      memberOrders: 820, customerAverage: 5500, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P003', productName: '카스', category: '주류', categoryCode: 'C01',
      salesDays: 30, orderCount: 1380, orderItems: 1380, orderQuantity: 2070,
      unitPrice: 5000, totalSalesAmount: 6900000,
      cancelCount: 6, cancelQuantity: 9, cancelAmount: 22500,
      discountQuantity: 48, discountAmount: 120000,
      actualSalesQty: 2013, actualUnitPrice: 4950, actualSalesAmount: 6757500,
      supplyPrice: 6143000, vat: 614300, netSalesAmount: 6143000,
      paymentAmount: 6757500, cashPayment: 1351500, cardPayment: 5406000,
      dineInOrders: 920, dineInSales: 4600000, takeoutOrders: 230, takeoutSales: 1150000,
      deliveryOrders: 230, deliverySales: 1150000,
      royaltyRate: 3, royaltyAmount: 184290,
      normalSalesQty: 1960, serviceQuantity: 53, returnQuantity: 9,
      memberOrders: 710, customerAverage: 5000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P004', productName: '처음처럼', category: '주류', categoryCode: 'C01',
      salesDays: 30, orderCount: 1150, orderItems: 1150, orderQuantity: 2300,
      unitPrice: 5000, totalSalesAmount: 5750000,
      cancelCount: 5, cancelQuantity: 10, cancelAmount: 25000,
      discountQuantity: 40, discountAmount: 100000,
      actualSalesQty: 2250, actualUnitPrice: 4950, actualSalesAmount: 5625000,
      supplyPrice: 5114000, vat: 511400, netSalesAmount: 5114000,
      paymentAmount: 5625000, cashPayment: 1125000, cardPayment: 4500000,
      dineInOrders: 750, dineInSales: 3750000, takeoutOrders: 200, takeoutSales: 1000000,
      deliveryOrders: 200, deliverySales: 1000000,
      royaltyRate: 3, royaltyAmount: 153420,
      normalSalesQty: 2200, serviceQuantity: 50, returnQuantity: 10,
      memberOrders: 600, customerAverage: 5000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P005', productName: '테라', category: '주류', categoryCode: 'C01',
      salesDays: 30, orderCount: 980, orderItems: 980, orderQuantity: 1470,
      unitPrice: 5000, totalSalesAmount: 4900000,
      cancelCount: 4, cancelQuantity: 6, cancelAmount: 15000,
      discountQuantity: 32, discountAmount: 80000,
      actualSalesQty: 1432, actualUnitPrice: 4960, actualSalesAmount: 4805000,
      supplyPrice: 4368000, vat: 436800, netSalesAmount: 4368000,
      paymentAmount: 4805000, cashPayment: 961000, cardPayment: 3844000,
      dineInOrders: 650, dineInSales: 3250000, takeoutOrders: 165, takeoutSales: 825000,
      deliveryOrders: 165, deliverySales: 825000,
      royaltyRate: 3, royaltyAmount: 131040,
      normalSalesQty: 1400, serviceQuantity: 32, returnQuantity: 6,
      memberOrders: 520, customerAverage: 5000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P006', productName: '하이볼', category: '주류', categoryCode: 'C01',
      salesDays: 30, orderCount: 720, orderItems: 720, orderQuantity: 720,
      unitPrice: 8000, totalSalesAmount: 5760000,
      cancelCount: 3, cancelQuantity: 3, cancelAmount: 12000,
      discountQuantity: 20, discountAmount: 80000,
      actualSalesQty: 697, actualUnitPrice: 7940, actualSalesAmount: 5668000,
      supplyPrice: 5153000, vat: 515300, netSalesAmount: 5153000,
      paymentAmount: 5668000, cashPayment: 1133600, cardPayment: 4534400,
      dineInOrders: 550, dineInSales: 4400000, takeoutOrders: 85, takeoutSales: 680000,
      deliveryOrders: 85, deliverySales: 680000,
      royaltyRate: 3, royaltyAmount: 154590,
      normalSalesQty: 690, serviceQuantity: 7, returnQuantity: 3,
      memberOrders: 400, customerAverage: 8000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P007', productName: '순살치킨', category: '치킨', categoryCode: 'C02',
      salesDays: 30, orderCount: 650, orderItems: 650, orderQuantity: 650,
      unitPrice: 17000, totalSalesAmount: 11050000,
      cancelCount: 5, cancelQuantity: 5, cancelAmount: 42500,
      discountQuantity: 18, discountAmount: 153000,
      actualSalesQty: 627, actualUnitPrice: 16850, actualSalesAmount: 10854500,
      supplyPrice: 9868000, vat: 986800, netSalesAmount: 9868000,
      paymentAmount: 10854500, cashPayment: 2170900, cardPayment: 8683600,
      dineInOrders: 380, dineInSales: 6460000, takeoutOrders: 135, takeoutSales: 2295000,
      deliveryOrders: 135, deliverySales: 2295000,
      royaltyRate: 3, royaltyAmount: 296040,
      normalSalesQty: 620, serviceQuantity: 7, returnQuantity: 5,
      memberOrders: 340, customerAverage: 17000, setQuantity: 45, setAmount: 765000,
    },
    {
      productCode: 'P008', productName: '양념치킨', category: '치킨', categoryCode: 'C02',
      salesDays: 30, orderCount: 580, orderItems: 580, orderQuantity: 580,
      unitPrice: 17000, totalSalesAmount: 9860000,
      cancelCount: 4, cancelQuantity: 4, cancelAmount: 34000,
      discountQuantity: 15, discountAmount: 127500,
      actualSalesQty: 561, actualUnitPrice: 16900, actualSalesAmount: 9698500,
      supplyPrice: 8817000, vat: 881700, netSalesAmount: 8817000,
      paymentAmount: 9698500, cashPayment: 1939700, cardPayment: 7758800,
      dineInOrders: 340, dineInSales: 5780000, takeoutOrders: 120, takeoutSales: 2040000,
      deliveryOrders: 120, deliverySales: 2040000,
      royaltyRate: 3, royaltyAmount: 264510,
      normalSalesQty: 555, serviceQuantity: 6, returnQuantity: 4,
      memberOrders: 310, customerAverage: 17000, setQuantity: 38, setAmount: 646000,
    },
    {
      productCode: 'P009', productName: '후라이드치킨', category: '치킨', categoryCode: 'C02',
      salesDays: 30, orderCount: 520, orderItems: 520, orderQuantity: 520,
      unitPrice: 16000, totalSalesAmount: 8320000,
      cancelCount: 3, cancelQuantity: 3, cancelAmount: 24000,
      discountQuantity: 12, discountAmount: 96000,
      actualSalesQty: 505, actualUnitPrice: 15920, actualSalesAmount: 8200000,
      supplyPrice: 7455000, vat: 745500, netSalesAmount: 7455000,
      paymentAmount: 8200000, cashPayment: 1640000, cardPayment: 6560000,
      dineInOrders: 310, dineInSales: 4960000, takeoutOrders: 105, takeoutSales: 1680000,
      deliveryOrders: 105, deliverySales: 1680000,
      royaltyRate: 3, royaltyAmount: 223650,
      normalSalesQty: 498, serviceQuantity: 7, returnQuantity: 3,
      memberOrders: 280, customerAverage: 16000, setQuantity: 32, setAmount: 512000,
    },
    {
      productCode: 'P010', productName: '닭강정', category: '치킨', categoryCode: 'C02',
      salesDays: 30, orderCount: 380, orderItems: 380, orderQuantity: 380,
      unitPrice: 15000, totalSalesAmount: 5700000,
      cancelCount: 2, cancelQuantity: 2, cancelAmount: 15000,
      discountQuantity: 10, discountAmount: 75000,
      actualSalesQty: 368, actualUnitPrice: 14900, actualSalesAmount: 5610000,
      supplyPrice: 5100000, vat: 510000, netSalesAmount: 5100000,
      paymentAmount: 5610000, cashPayment: 1122000, cardPayment: 4488000,
      dineInOrders: 240, dineInSales: 3600000, takeoutOrders: 70, takeoutSales: 1050000,
      deliveryOrders: 70, deliverySales: 1050000,
      royaltyRate: 3, royaltyAmount: 153000,
      normalSalesQty: 362, serviceQuantity: 6, returnQuantity: 2,
      memberOrders: 200, customerAverage: 15000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P011', productName: '모둠튀김', category: '튀김', categoryCode: 'C03',
      salesDays: 30, orderCount: 620, orderItems: 620, orderQuantity: 620,
      unitPrice: 9000, totalSalesAmount: 5580000,
      cancelCount: 3, cancelQuantity: 3, cancelAmount: 13500,
      discountQuantity: 15, discountAmount: 67500,
      actualSalesQty: 602, actualUnitPrice: 8950, actualSalesAmount: 5499000,
      supplyPrice: 4999000, vat: 499900, netSalesAmount: 4999000,
      paymentAmount: 5499000, cashPayment: 1099800, cardPayment: 4399200,
      dineInOrders: 400, dineInSales: 3600000, takeoutOrders: 110, takeoutSales: 990000,
      deliveryOrders: 110, deliverySales: 990000,
      royaltyRate: 3, royaltyAmount: 149970,
      normalSalesQty: 595, serviceQuantity: 7, returnQuantity: 3,
      memberOrders: 320, customerAverage: 9000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P012', productName: '새우튀김', category: '튀김', categoryCode: 'C03',
      salesDays: 30, orderCount: 450, orderItems: 450, orderQuantity: 450,
      unitPrice: 9000, totalSalesAmount: 4050000,
      cancelCount: 2, cancelQuantity: 2, cancelAmount: 9000,
      discountQuantity: 10, discountAmount: 45000,
      actualSalesQty: 438, actualUnitPrice: 8960, actualSalesAmount: 3996000,
      supplyPrice: 3633000, vat: 363300, netSalesAmount: 3633000,
      paymentAmount: 3996000, cashPayment: 799200, cardPayment: 3196800,
      dineInOrders: 290, dineInSales: 2610000, takeoutOrders: 80, takeoutSales: 720000,
      deliveryOrders: 80, deliverySales: 720000,
      royaltyRate: 3, royaltyAmount: 108990,
      normalSalesQty: 432, serviceQuantity: 6, returnQuantity: 2,
      memberOrders: 230, customerAverage: 9000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P013', productName: '오징어튀김', category: '튀김', categoryCode: 'C03',
      salesDays: 30, orderCount: 380, orderItems: 380, orderQuantity: 380,
      unitPrice: 8000, totalSalesAmount: 3040000,
      cancelCount: 2, cancelQuantity: 2, cancelAmount: 8000,
      discountQuantity: 8, discountAmount: 32000,
      actualSalesQty: 370, actualUnitPrice: 7960, actualSalesAmount: 3000000,
      supplyPrice: 2727000, vat: 272700, netSalesAmount: 2727000,
      paymentAmount: 3000000, cashPayment: 600000, cardPayment: 2400000,
      dineInOrders: 250, dineInSales: 2000000, takeoutOrders: 65, takeoutSales: 520000,
      deliveryOrders: 65, deliverySales: 520000,
      royaltyRate: 3, royaltyAmount: 81810,
      normalSalesQty: 365, serviceQuantity: 5, returnQuantity: 2,
      memberOrders: 200, customerAverage: 8000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P014', productName: '감자튀김', category: '튀김', categoryCode: 'C03',
      salesDays: 30, orderCount: 520, orderItems: 520, orderQuantity: 520,
      unitPrice: 7000, totalSalesAmount: 3640000,
      cancelCount: 2, cancelQuantity: 2, cancelAmount: 7000,
      discountQuantity: 12, discountAmount: 42000,
      actualSalesQty: 506, actualUnitPrice: 6960, actualSalesAmount: 3591000,
      supplyPrice: 3265000, vat: 326500, netSalesAmount: 3265000,
      paymentAmount: 3591000, cashPayment: 718200, cardPayment: 2872800,
      dineInOrders: 340, dineInSales: 2380000, takeoutOrders: 90, takeoutSales: 630000,
      deliveryOrders: 90, deliverySales: 630000,
      royaltyRate: 3, royaltyAmount: 97950,
      normalSalesQty: 500, serviceQuantity: 6, returnQuantity: 2,
      memberOrders: 270, customerAverage: 7000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P015', productName: '김치찌개', category: '탕', categoryCode: 'C04',
      salesDays: 30, orderCount: 340, orderItems: 340, orderQuantity: 340,
      unitPrice: 8000, totalSalesAmount: 2720000,
      cancelCount: 1, cancelQuantity: 1, cancelAmount: 4000,
      discountQuantity: 6, discountAmount: 24000,
      actualSalesQty: 333, actualUnitPrice: 7960, actualSalesAmount: 2692000,
      supplyPrice: 2447000, vat: 244700, netSalesAmount: 2447000,
      paymentAmount: 2692000, cashPayment: 538400, cardPayment: 2153600,
      dineInOrders: 280, dineInSales: 2240000, takeoutOrders: 30, takeoutSales: 240000,
      deliveryOrders: 30, deliverySales: 240000,
      royaltyRate: 3, royaltyAmount: 73410,
      normalSalesQty: 330, serviceQuantity: 3, returnQuantity: 1,
      memberOrders: 180, customerAverage: 8000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P016', productName: '부대찌개', category: '탕', categoryCode: 'C04',
      salesDays: 30, orderCount: 280, orderItems: 280, orderQuantity: 280,
      unitPrice: 11000, totalSalesAmount: 3080000,
      cancelCount: 1, cancelQuantity: 1, cancelAmount: 5500,
      discountQuantity: 5, discountAmount: 27500,
      actualSalesQty: 274, actualUnitPrice: 10940, actualSalesAmount: 3047000,
      supplyPrice: 2770000, vat: 277000, netSalesAmount: 2770000,
      paymentAmount: 3047000, cashPayment: 609400, cardPayment: 2437600,
      dineInOrders: 240, dineInSales: 2640000, takeoutOrders: 20, takeoutSales: 220000,
      deliveryOrders: 20, deliverySales: 220000,
      royaltyRate: 3, royaltyAmount: 83100,
      normalSalesQty: 270, serviceQuantity: 4, returnQuantity: 1,
      memberOrders: 150, customerAverage: 11000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P017', productName: '순두부찌개', category: '탕', categoryCode: 'C04',
      salesDays: 30, orderCount: 220, orderItems: 220, orderQuantity: 220,
      unitPrice: 8000, totalSalesAmount: 1760000,
      cancelCount: 1, cancelQuantity: 1, cancelAmount: 4000,
      discountQuantity: 4, discountAmount: 16000,
      actualSalesQty: 215, actualUnitPrice: 7960, actualSalesAmount: 1740000,
      supplyPrice: 1582000, vat: 158200, netSalesAmount: 1582000,
      paymentAmount: 1740000, cashPayment: 348000, cardPayment: 1392000,
      dineInOrders: 190, dineInSales: 1520000, takeoutOrders: 15, takeoutSales: 120000,
      deliveryOrders: 15, deliverySales: 120000,
      royaltyRate: 3, royaltyAmount: 47460,
      normalSalesQty: 212, serviceQuantity: 3, returnQuantity: 1,
      memberOrders: 110, customerAverage: 8000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P018', productName: '콜라', category: '음료', categoryCode: 'C05',
      salesDays: 30, orderCount: 850, orderItems: 850, orderQuantity: 850,
      unitPrice: 3000, totalSalesAmount: 2550000,
      cancelCount: 3, cancelQuantity: 3, cancelAmount: 4500,
      discountQuantity: 20, discountAmount: 30000,
      actualSalesQty: 827, actualUnitPrice: 2970, actualSalesAmount: 2515500,
      supplyPrice: 2287000, vat: 228700, netSalesAmount: 2287000,
      paymentAmount: 2515500, cashPayment: 503100, cardPayment: 2012400,
      dineInOrders: 550, dineInSales: 1650000, takeoutOrders: 150, takeoutSales: 450000,
      deliveryOrders: 150, deliverySales: 450000,
      royaltyRate: 3, royaltyAmount: 68610,
      normalSalesQty: 820, serviceQuantity: 7, returnQuantity: 3,
      memberOrders: 450, customerAverage: 3000, setQuantity: 120, setAmount: 360000,
    },
    {
      productCode: 'P019', productName: '사이다', category: '음료', categoryCode: 'C05',
      salesDays: 30, orderCount: 680, orderItems: 680, orderQuantity: 680,
      unitPrice: 3000, totalSalesAmount: 2040000,
      cancelCount: 2, cancelQuantity: 2, cancelAmount: 3000,
      discountQuantity: 16, discountAmount: 24000,
      actualSalesQty: 662, actualUnitPrice: 2970, actualSalesAmount: 2013000,
      supplyPrice: 1830000, vat: 183000, netSalesAmount: 1830000,
      paymentAmount: 2013000, cashPayment: 402600, cardPayment: 1610400,
      dineInOrders: 440, dineInSales: 1320000, takeoutOrders: 120, takeoutSales: 360000,
      deliveryOrders: 120, deliverySales: 360000,
      royaltyRate: 3, royaltyAmount: 54900,
      normalSalesQty: 655, serviceQuantity: 7, returnQuantity: 2,
      memberOrders: 360, customerAverage: 3000, setQuantity: 95, setAmount: 285000,
    },
    {
      productCode: 'P020', productName: '제로콜라', category: '음료', categoryCode: 'C05',
      salesDays: 30, orderCount: 520, orderItems: 520, orderQuantity: 520,
      unitPrice: 3000, totalSalesAmount: 1560000,
      cancelCount: 2, cancelQuantity: 2, cancelAmount: 3000,
      discountQuantity: 12, discountAmount: 18000,
      actualSalesQty: 506, actualUnitPrice: 2970, actualSalesAmount: 1539000,
      supplyPrice: 1399000, vat: 139900, netSalesAmount: 1399000,
      paymentAmount: 1539000, cashPayment: 307800, cardPayment: 1231200,
      dineInOrders: 340, dineInSales: 1020000, takeoutOrders: 90, takeoutSales: 270000,
      deliveryOrders: 90, deliverySales: 270000,
      royaltyRate: 3, royaltyAmount: 41970,
      normalSalesQty: 500, serviceQuantity: 6, returnQuantity: 2,
      memberOrders: 280, customerAverage: 3000, setQuantity: 80, setAmount: 240000,
    },
    {
      productCode: 'P021', productName: '두부김치', category: '안주', categoryCode: 'C06',
      salesDays: 30, orderCount: 420, orderItems: 420, orderQuantity: 420,
      unitPrice: 12000, totalSalesAmount: 5040000,
      cancelCount: 2, cancelQuantity: 2, cancelAmount: 12000,
      discountQuantity: 10, discountAmount: 60000,
      actualSalesQty: 408, actualUnitPrice: 11920, actualSalesAmount: 4968000,
      supplyPrice: 4516000, vat: 451600, netSalesAmount: 4516000,
      paymentAmount: 4968000, cashPayment: 993600, cardPayment: 3974400,
      dineInOrders: 320, dineInSales: 3840000, takeoutOrders: 50, takeoutSales: 600000,
      deliveryOrders: 50, deliverySales: 600000,
      royaltyRate: 3, royaltyAmount: 135480,
      normalSalesQty: 405, serviceQuantity: 3, returnQuantity: 2,
      memberOrders: 220, customerAverage: 12000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P022', productName: '골뱅이소면', category: '안주', categoryCode: 'C06',
      salesDays: 30, orderCount: 350, orderItems: 350, orderQuantity: 350,
      unitPrice: 13000, totalSalesAmount: 4550000,
      cancelCount: 2, cancelQuantity: 2, cancelAmount: 13000,
      discountQuantity: 8, discountAmount: 52000,
      actualSalesQty: 340, actualUnitPrice: 12930, actualSalesAmount: 4485000,
      supplyPrice: 4077000, vat: 407700, netSalesAmount: 4077000,
      paymentAmount: 4485000, cashPayment: 897000, cardPayment: 3588000,
      dineInOrders: 280, dineInSales: 3640000, takeoutOrders: 35, takeoutSales: 455000,
      deliveryOrders: 35, deliverySales: 455000,
      royaltyRate: 3, royaltyAmount: 122310,
      normalSalesQty: 335, serviceQuantity: 5, returnQuantity: 2,
      memberOrders: 180, customerAverage: 13000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P023', productName: '계란말이', category: '사이드', categoryCode: 'C07',
      salesDays: 30, orderCount: 480, orderItems: 480, orderQuantity: 480,
      unitPrice: 7000, totalSalesAmount: 3360000,
      cancelCount: 2, cancelQuantity: 2, cancelAmount: 7000,
      discountQuantity: 10, discountAmount: 35000,
      actualSalesQty: 468, actualUnitPrice: 6960, actualSalesAmount: 3318000,
      supplyPrice: 3016000, vat: 301600, netSalesAmount: 3016000,
      paymentAmount: 3318000, cashPayment: 663600, cardPayment: 2654400,
      dineInOrders: 340, dineInSales: 2380000, takeoutOrders: 70, takeoutSales: 490000,
      deliveryOrders: 70, deliverySales: 490000,
      royaltyRate: 3, royaltyAmount: 90480,
      normalSalesQty: 462, serviceQuantity: 6, returnQuantity: 2,
      memberOrders: 250, customerAverage: 7000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P024', productName: '주먹밥', category: '식사', categoryCode: 'C08',
      salesDays: 30, orderCount: 320, orderItems: 320, orderQuantity: 320,
      unitPrice: 6000, totalSalesAmount: 1920000,
      cancelCount: 1, cancelQuantity: 1, cancelAmount: 3000,
      discountQuantity: 6, discountAmount: 18000,
      actualSalesQty: 313, actualUnitPrice: 5970, actualSalesAmount: 1899000,
      supplyPrice: 1726000, vat: 172600, netSalesAmount: 1726000,
      paymentAmount: 1899000, cashPayment: 379800, cardPayment: 1519200,
      dineInOrders: 250, dineInSales: 1500000, takeoutOrders: 35, takeoutSales: 210000,
      deliveryOrders: 35, deliverySales: 210000,
      royaltyRate: 3, royaltyAmount: 51780,
      normalSalesQty: 310, serviceQuantity: 3, returnQuantity: 1,
      memberOrders: 160, customerAverage: 6000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P025', productName: '볶음밥', category: '식사', categoryCode: 'C08',
      salesDays: 30, orderCount: 280, orderItems: 280, orderQuantity: 280,
      unitPrice: 8000, totalSalesAmount: 2240000,
      cancelCount: 1, cancelQuantity: 1, cancelAmount: 4000,
      discountQuantity: 5, discountAmount: 20000,
      actualSalesQty: 274, actualUnitPrice: 7960, actualSalesAmount: 2216000,
      supplyPrice: 2015000, vat: 201500, netSalesAmount: 2015000,
      paymentAmount: 2216000, cashPayment: 443200, cardPayment: 1772800,
      dineInOrders: 220, dineInSales: 1760000, takeoutOrders: 30, takeoutSales: 240000,
      deliveryOrders: 30, deliverySales: 240000,
      royaltyRate: 3, royaltyAmount: 60450,
      normalSalesQty: 270, serviceQuantity: 4, returnQuantity: 1,
      memberOrders: 140, customerAverage: 8000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P026', productName: '소떡소떡', category: '사이드', categoryCode: 'C07',
      salesDays: 30, orderCount: 380, orderItems: 380, orderQuantity: 380,
      unitPrice: 6000, totalSalesAmount: 2280000,
      cancelCount: 1, cancelQuantity: 1, cancelAmount: 3000,
      discountQuantity: 8, discountAmount: 24000,
      actualSalesQty: 371, actualUnitPrice: 5960, actualSalesAmount: 2253000,
      supplyPrice: 2048000, vat: 204800, netSalesAmount: 2048000,
      paymentAmount: 2253000, cashPayment: 450600, cardPayment: 1802400,
      dineInOrders: 260, dineInSales: 1560000, takeoutOrders: 60, takeoutSales: 360000,
      deliveryOrders: 60, deliverySales: 360000,
      royaltyRate: 3, royaltyAmount: 61440,
      normalSalesQty: 368, serviceQuantity: 3, returnQuantity: 1,
      memberOrders: 200, customerAverage: 6000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P027', productName: '떡볶이', category: '사이드', categoryCode: 'C07',
      salesDays: 30, orderCount: 420, orderItems: 420, orderQuantity: 420,
      unitPrice: 7000, totalSalesAmount: 2940000,
      cancelCount: 2, cancelQuantity: 2, cancelAmount: 7000,
      discountQuantity: 10, discountAmount: 35000,
      actualSalesQty: 408, actualUnitPrice: 6960, actualSalesAmount: 2898000,
      supplyPrice: 2635000, vat: 263500, netSalesAmount: 2635000,
      paymentAmount: 2898000, cashPayment: 579600, cardPayment: 2318400,
      dineInOrders: 300, dineInSales: 2100000, takeoutOrders: 60, takeoutSales: 420000,
      deliveryOrders: 60, deliverySales: 420000,
      royaltyRate: 3, royaltyAmount: 79050,
      normalSalesQty: 402, serviceQuantity: 6, returnQuantity: 2,
      memberOrders: 220, customerAverage: 7000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P028', productName: '매실주', category: '주류', categoryCode: 'C01',
      salesDays: 30, orderCount: 280, orderItems: 280, orderQuantity: 280,
      unitPrice: 6000, totalSalesAmount: 1680000,
      cancelCount: 1, cancelQuantity: 1, cancelAmount: 3000,
      discountQuantity: 5, discountAmount: 15000,
      actualSalesQty: 274, actualUnitPrice: 5960, actualSalesAmount: 1662000,
      supplyPrice: 1511000, vat: 151100, netSalesAmount: 1511000,
      paymentAmount: 1662000, cashPayment: 332400, cardPayment: 1329600,
      dineInOrders: 220, dineInSales: 1320000, takeoutOrders: 30, takeoutSales: 180000,
      deliveryOrders: 30, deliverySales: 180000,
      royaltyRate: 3, royaltyAmount: 45330,
      normalSalesQty: 270, serviceQuantity: 4, returnQuantity: 1,
      memberOrders: 150, customerAverage: 6000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P029', productName: '막걸리', category: '주류', categoryCode: 'C01',
      salesDays: 30, orderCount: 350, orderItems: 350, orderQuantity: 350,
      unitPrice: 5000, totalSalesAmount: 1750000,
      cancelCount: 1, cancelQuantity: 1, cancelAmount: 2500,
      discountQuantity: 6, discountAmount: 15000,
      actualSalesQty: 343, actualUnitPrice: 4970, actualSalesAmount: 1732500,
      supplyPrice: 1575000, vat: 157500, netSalesAmount: 1575000,
      paymentAmount: 1732500, cashPayment: 346500, cardPayment: 1386000,
      dineInOrders: 280, dineInSales: 1400000, takeoutOrders: 35, takeoutSales: 175000,
      deliveryOrders: 35, deliverySales: 175000,
      royaltyRate: 3, royaltyAmount: 47250,
      normalSalesQty: 340, serviceQuantity: 3, returnQuantity: 1,
      memberOrders: 180, customerAverage: 5000, setQuantity: 0, setAmount: 0,
    },
    {
      productCode: 'P030', productName: '어묵탕', category: '탕', categoryCode: 'C04',
      salesDays: 30, orderCount: 310, orderItems: 310, orderQuantity: 310,
      unitPrice: 10000, totalSalesAmount: 3100000,
      cancelCount: 1, cancelQuantity: 1, cancelAmount: 5000,
      discountQuantity: 6, discountAmount: 30000,
      actualSalesQty: 303, actualUnitPrice: 9940, actualSalesAmount: 3065000,
      supplyPrice: 2786000, vat: 278600, netSalesAmount: 2786000,
      paymentAmount: 3065000, cashPayment: 613000, cardPayment: 2452000,
      dineInOrders: 250, dineInSales: 2500000, takeoutOrders: 30, takeoutSales: 300000,
      deliveryOrders: 30, deliverySales: 300000,
      royaltyRate: 3, royaltyAmount: 83580,
      normalSalesQty: 300, serviceQuantity: 3, returnQuantity: 1,
      memberOrders: 160, customerAverage: 10000, setQuantity: 0, setAmount: 0,
    },
  ];

  // Add more products to reach 50
  const extraProducts: Partial<ProductSalesData>[] = [
    { productCode: 'P031', productName: '치즈볼', category: '사이드', categoryCode: 'C07', unitPrice: 6000, orderCount: 290, totalSalesAmount: 1740000 },
    { productCode: 'P032', productName: '오뎅', category: '안주', categoryCode: 'C06', unitPrice: 5000, orderCount: 250, totalSalesAmount: 1250000 },
    { productCode: 'P033', productName: '진로', category: '주류', categoryCode: 'C01', unitPrice: 5000, orderCount: 680, totalSalesAmount: 3400000 },
    { productCode: 'P034', productName: '한라산소주', category: '주류', categoryCode: 'C01', unitPrice: 5500, orderCount: 180, totalSalesAmount: 990000 },
    { productCode: 'P035', productName: '크림생맥주', category: '주류', categoryCode: 'C01', unitPrice: 6000, orderCount: 420, totalSalesAmount: 2520000 },
    { productCode: 'P036', productName: '과일소주', category: '주류', categoryCode: 'C01', unitPrice: 5000, orderCount: 320, totalSalesAmount: 1600000 },
    { productCode: 'P037', productName: '핫도그', category: '사이드', categoryCode: 'C07', unitPrice: 5000, orderCount: 340, totalSalesAmount: 1700000 },
    { productCode: 'P038', productName: '치킨너겟', category: '치킨', categoryCode: 'C02', unitPrice: 8000, orderCount: 260, totalSalesAmount: 2080000 },
    { productCode: 'P039', productName: '양파링', category: '튀김', categoryCode: 'C03', unitPrice: 5000, orderCount: 310, totalSalesAmount: 1550000 },
    { productCode: 'P040', productName: '물', category: '음료', categoryCode: 'C05', unitPrice: 1000, orderCount: 620, totalSalesAmount: 620000 },
    { productCode: 'P041', productName: '쥬시쿨', category: '음료', categoryCode: 'C05', unitPrice: 2000, orderCount: 180, totalSalesAmount: 360000 },
    { productCode: 'P042', productName: '밀크셰이크', category: '음료', categoryCode: 'C05', unitPrice: 5000, orderCount: 120, totalSalesAmount: 600000 },
    { productCode: 'P043', productName: '알밤', category: '주류', categoryCode: 'C01', unitPrice: 5000, orderCount: 240, totalSalesAmount: 1200000 },
    { productCode: 'P044', productName: '소시지구이', category: '안주', categoryCode: 'C06', unitPrice: 8000, orderCount: 200, totalSalesAmount: 1600000 },
    { productCode: 'P045', productName: '닭발', category: '안주', categoryCode: 'C06', unitPrice: 12000, orderCount: 180, totalSalesAmount: 2160000 },
    { productCode: 'P046', productName: '콘치즈', category: '사이드', categoryCode: 'C07', unitPrice: 6000, orderCount: 220, totalSalesAmount: 1320000 },
    { productCode: 'P047', productName: '김치볶음밥', category: '식사', categoryCode: 'C08', unitPrice: 8000, orderCount: 200, totalSalesAmount: 1600000 },
    { productCode: 'P048', productName: '라면', category: '식사', categoryCode: 'C08', unitPrice: 4000, orderCount: 350, totalSalesAmount: 1400000 },
    { productCode: 'P049', productName: '짜파게티', category: '식사', categoryCode: 'C08', unitPrice: 5000, orderCount: 150, totalSalesAmount: 750000 },
    { productCode: 'P050', productName: '아이스크림', category: '디저트', categoryCode: 'C09', unitPrice: 3000, orderCount: 280, totalSalesAmount: 840000 },
  ];

  const fullExtraProducts = extraProducts.map((p) => {
    const oc = p.orderCount ?? 200;
    const up = p.unitPrice ?? 5000;
    const tsa = p.totalSalesAmount ?? oc * up;
    const cc = Math.round(oc * 0.01);
    const cq = cc;
    const ca = cq * up;
    const dq = Math.round(oc * 0.03);
    const da = dq * up * 0.5;
    const asq = oc - cc - dq;
    const asa = tsa - ca - da;
    const sp = Math.round(asa * 0.909);
    const v = asa - sp;
    const cardR = 0.8;
    const card = Math.round(asa * cardR);
    const cash = asa - card;
    const diO = Math.round(oc * 0.65);
    const toO = Math.round(oc * 0.18);
    const deO = oc - diO - toO;

    return {
      productCode: p.productCode!,
      productName: p.productName!,
      category: p.category!,
      categoryCode: p.categoryCode!,
      salesDays: 30,
      orderCount: oc,
      orderItems: oc,
      orderQuantity: oc,
      unitPrice: up,
      totalSalesAmount: tsa,
      cancelCount: cc,
      cancelQuantity: cq,
      cancelAmount: ca,
      discountQuantity: dq,
      discountAmount: da,
      actualSalesQty: asq,
      actualUnitPrice: Math.round(asa / asq),
      actualSalesAmount: asa,
      supplyPrice: sp,
      vat: v,
      netSalesAmount: sp,
      paymentAmount: asa,
      cashPayment: cash,
      cardPayment: card,
      dineInOrders: diO,
      dineInSales: diO * up,
      takeoutOrders: toO,
      takeoutSales: toO * up,
      deliveryOrders: deO,
      deliverySales: deO * up,
      royaltyRate: 3,
      royaltyAmount: Math.round(sp * 0.03),
      normalSalesQty: asq - Math.round(oc * 0.01),
      serviceQuantity: Math.round(oc * 0.01),
      returnQuantity: cc,
      memberOrders: Math.round(oc * 0.5),
      customerAverage: up,
      setQuantity: 0,
      setAmount: 0,
    } as ProductSalesData;
  });

  return [...products, ...fullExtraProducts];
}

function generateHeatmapData(): HeatmapData[] {
  const data: HeatmapData[] = [];
  const dayPatterns = [0.7, 1.0, 0.9, 0.95, 1.1, 1.3, 0.8]; // Sun-Sat
  const hourPatterns = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 8,
    12, 8, 4, 3, 5, 10, 15, 13, 10, 6, 3, 1,
  ];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const value = Math.round(hourPatterns[hour] * dayPatterns[day] * (0.8 + Math.random() * 0.4));
      data.push({ day, hour, value });
    }
  }
  return data;
}

// Cached data
const dailySalesData = generateDailySales();
const hourlySalesData = generateHourlySales();
const menuSalesData = generateMenuSales();
const salesComparisonData = generateSalesComparison();
const salesTargetsData = generateSalesTargets();
const productSalesData = generateProductSalesData();
const heatmapData = generateHeatmapData();

// Export helper functions
export function getDailySalesData(): SalesDailyData[] {
  return dailySalesData;
}

export function getHourlySalesData(): SalesHourlyData[] {
  return hourlySalesData;
}

export function getSalesByMenu(): SalesByMenuData[] {
  return menuSalesData;
}

export function getSalesComparison(): SalesComparison[] {
  return salesComparisonData;
}

export function getSalesTargets(): SalesTarget[] {
  return salesTargetsData;
}

export function getProductSalesData(): ProductSalesData[] {
  return productSalesData;
}

export function getHeatmapData(): HeatmapData[] {
  return heatmapData;
}

export { menuCategories };
