import * as XLSX from 'xlsx';
import type {
  ExcelProductData,
  PriceSimulation,
  ColumnConfig,
} from './types';

// Fixed column index mapping for the POS sales Excel format (판매현황.xls)
// This format is consistent: 75 columns (0-74), always in the same order.
// Using index-based mapping because browser XLSX cannot decode EUC-KR headers reliably.
const COLUMN_INDEX_MAP: Record<number, keyof ExcelProductData> = {
  0: 'rowNum',           // /
  1: 'categoryName',     // 분류명
  2: 'productCode',      // 상품코드
  3: 'barcode',          // 바코드
  4: 'productAbCode',    // 상품AB코드
  5: 'productName',      // 상품명
  6: 'salesDays',        // 판매일
  7: 'orderCount',       // 주문수
  8: 'orderItems',       // 주문건
  9: 'orderQuantity',    // 주문량
  10: 'unitPrice',       // 판매단가
  11: 'totalSalesAmount',// 판매가
  12: 'cancelCount',     // 취소수
  13: 'cancelQuantity',  // 취소량
  14: 'cancelAmount',    // 취소금액
  15: 'discountQuantity',// 할인량
  16: 'discountAmount',  // 할인금액
  17: 'salesQuantity',   // 판매량
  18: 'actualUnitPrice', // 실판매단가
  19: 'actualSalesAmount',// 실판매금액
  20: 'supplyPrice',     // 공급가액
  21: 'vat',             // VAT
  22: 'taxExemptAmount', // 면세금액
  23: 'totalDiscount',   // 전체할인
  24: 'netSalesAmount',  // 순판매금액
  25: 'vatTruncation',   // VAT절사
  26: 'finalSupplyPrice',// 최종 공급가
  27: 'finalVat',        // 최종 VAT
  28: 'paymentAmount',   // 결제금액
  29: 'cashPayment',     // 현금결제
  30: 'cardPayment',     // 카드결제
  31: 'creditPayment',   // 외상결제
  32: 'couponPayment',   // 쿠폰결제
  33: 'agencyPayment',   // 대행결제
  34: 'envFeeQuantity',  // 환경분담수량
  35: 'envFeeAmount',    // 환경분담금
  36: 'dineInOrders',    // 매장건
  37: 'dineInQuantity',  // 매장
  38: 'dineInSales',     // 매장판매
  39: 'takeoutOrders',   // 포장건
  40: 'takeoutQuantity', // 포장
  41: 'takeoutSales',    // 포장판매
  42: 'deliveryOrders',  // 배달건
  43: 'deliveryQuantity',// 배달
  44: 'deliverySales',   // 배달판매
  45: 'royaltyRate',     // 로얄티율
  46: 'royaltyAmount',   // 로얄티금액
  47: 'normalSalesQty',  // 정상판매
  48: 'normalUnitPrice', // 정상단가
  49: 'normalSalesAmount',// 정상매상고
  50: 'discountUnitPrice',// 할인단가
  51: 'serviceQuantity', // 서비스량
  52: 'serviceAmount',   // 서비스액
  53: 'returnQuantity',  // 반품량
  54: 'returnAmount',    // 반품액
  55: 'serviceQuantity2',// 서비스량 (2nd)
  56: 'memberOrders',    // 회원건
  57: 'memberOrderCount',// 회원주문
  58: 'memberSalesAmount',// 회원매상고
  59: 'customerAverage', // 고객평균
  60: 'firstCustomerAvg',// 1st고객평균
  61: 'secondCustomerAvg',// 2nd고객평균
  62: 'orderLoc',        // 주문LOC
  63: 'mealTime',        // 식사시간
  64: 'setQuantity',     // 세트수량
  65: 'setAmount',       // 세트금액
  66: 'courseQuantity',   // 코스수량
  67: 'courseAmount',     // 코스금액
  68: 'pointAmount',     // 포인트 금액
  69: 'pointQuantity',   // 포인트수량
  70: 'categorySortOrder',// 분류순
  71: 'productSortOrder',// 상품순
  72: 'totalSalesDays',  // 총판매일
  73: 'categoryCode',    // 상품분류코드
};

// String fields in ExcelProductData
const STRING_FIELDS: Set<keyof ExcelProductData> = new Set([
  'categoryName',
  'productCode',
  'barcode',
  'productAbCode',
  'productName',
  'categoryCode',
]);

// Decode EUC-KR garbled strings from .xls files
// Browser XLSX reads .xls (BIFF) string cells as raw bytes interpreted as latin1,
// so we need to convert back to bytes and re-decode as EUC-KR.
function decodeEucKr(str: string): string {
  if (!str) return str;
  // Check if string contains characters above 0xFF (already unicode) or only ASCII
  let needsDecode = false;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code > 0x7E && code <= 0xFF) {
      needsDecode = true;
      break;
    }
    if (code > 0xFF) {
      // Already proper unicode
      return str;
    }
  }
  if (!needsDecode) return str;

  try {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i) & 0xFF;
    }
    return new TextDecoder('euc-kr').decode(bytes);
  } catch {
    return str;
  }
}

export async function parseExcelFile(file: File): Promise<ExcelProductData[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Parse all rows as arrays (skip header row with range: 1)
  const rawData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, range: 1 });

  console.log('[parseExcelFile] Raw rows:', rawData.length);

  const numericDefaults: Partial<ExcelProductData> = {
    salesDays: 0, orderCount: 0, orderItems: 0, orderQuantity: 0,
    unitPrice: 0, totalSalesAmount: 0, cancelCount: 0, cancelQuantity: 0,
    cancelAmount: 0, discountQuantity: 0, discountAmount: 0, salesQuantity: 0,
    actualUnitPrice: 0, actualSalesAmount: 0, supplyPrice: 0, vat: 0,
    taxExemptAmount: 0, totalDiscount: 0, netSalesAmount: 0, vatTruncation: 0,
    finalSupplyPrice: 0, finalVat: 0, paymentAmount: 0, cashPayment: 0,
    cardPayment: 0, creditPayment: 0, couponPayment: 0, agencyPayment: 0,
    envFeeQuantity: 0, envFeeAmount: 0, dineInOrders: 0, dineInQuantity: 0,
    dineInSales: 0, takeoutOrders: 0, takeoutQuantity: 0, takeoutSales: 0,
    deliveryOrders: 0, deliveryQuantity: 0, deliverySales: 0, royaltyRate: 0,
    royaltyAmount: 0, normalSalesQty: 0, normalUnitPrice: 0, normalSalesAmount: 0,
    discountUnitPrice: 0, serviceQuantity: 0, serviceAmount: 0, returnQuantity: 0,
    returnAmount: 0, serviceQuantity2: 0, memberOrders: 0, memberOrderCount: 0,
    memberSalesAmount: 0, customerAverage: 0, firstCustomerAvg: 0, secondCustomerAvg: 0,
    orderLoc: 0, mealTime: 0, setQuantity: 0, setAmount: 0, courseQuantity: 0,
    courseAmount: 0, pointAmount: 0, pointQuantity: 0, categorySortOrder: 0,
    productSortOrder: 0, totalSalesDays: 0,
  };

  const results: ExcelProductData[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const arr = rawData[i] as unknown[];
    if (!arr || arr.length === 0) continue;

    // Skip summary row: productName (col 5) contains "row(s)"
    const productName = arr[5];
    if (typeof productName === 'string' && productName.includes('row(s)')) continue;

    // Skip rows without category name (col 1)
    const categoryName = arr[1];
    if (categoryName === null || categoryName === undefined) continue;

    const mapped: Partial<ExcelProductData> = { ...numericDefaults };

    for (const [colStr, fieldName] of Object.entries(COLUMN_INDEX_MAP)) {
      const col = Number(colStr);
      const value = arr[col];

      if (STRING_FIELDS.has(fieldName)) {
        (mapped as Record<string, unknown>)[fieldName] =
          value != null ? decodeEucKr(String(value)) : fieldName === 'barcode' ? null : '';
      } else {
        (mapped as Record<string, unknown>)[fieldName] =
          typeof value === 'number' ? value : Number(value) || 0;
      }
    }

    if (!mapped.rowNum) mapped.rowNum = i + 1;

    results.push(mapped as ExcelProductData);
  }

  console.log('[parseExcelFile] Parsed products:', results.length);
  if (results.length > 0) {
    const s = results[0];
    console.log('[parseExcelFile] First:', s.productName, '| cat:', s.categoryName, '| sales:', s.actualSalesAmount, '| qty:', s.salesQuantity);
    const totalRev = results.reduce((sum, p) => sum + p.actualSalesAmount, 0);
    console.log('[parseExcelFile] Total revenue:', totalRev.toLocaleString());
  }

  return results;
}

export function calculateElasticity(product: ExcelProductData): number {
  const priceLevel = product.unitPrice;

  if (priceLevel <= 3000) return -0.3;
  if (priceLevel <= 7000) return -0.6;
  if (priceLevel <= 15000) return -0.9;
  if (priceLevel <= 25000) return -1.2;

  const salesPerDay = product.salesDays > 0 ? product.salesQuantity / product.salesDays : 0;
  const volumeAdjustment = salesPerDay > 5 ? 0.1 : 0;
  return -(1.5 - volumeAdjustment);
}

export function simulatePrice(
  product: ExcelProductData,
  newPrice: number
): PriceSimulation {
  const elasticity = calculateElasticity(product);
  const priceChangePercent = ((newPrice - product.unitPrice) / product.unitPrice) * 100;
  const quantityChangePercent = priceChangePercent * elasticity;
  const estimatedQuantity = Math.max(
    0,
    Math.floor(product.salesQuantity * (1 + quantityChangePercent / 100))
  );
  const estimatedRevenue = estimatedQuantity * newPrice;
  const currentRevenue = product.salesQuantity * product.unitPrice;

  return {
    productCode: product.productCode,
    productName: product.productName,
    currentPrice: product.unitPrice,
    currentQuantity: product.salesQuantity,
    currentRevenue,
    newPrice,
    priceChangePercent,
    elasticity,
    estimatedQuantity,
    estimatedRevenue,
    revenueChange: estimatedRevenue - currentRevenue,
    revenueChangePercent:
      currentRevenue > 0 ? ((estimatedRevenue - currentRevenue) / currentRevenue) * 100 : 0,
    profitImpact: estimatedRevenue - currentRevenue,
  };
}

// Full column Korean header mapping for CSV export
const FIELD_TO_KOREAN: Record<string, string> = {
  rowNum: '/',
  categoryName: '분류명',
  productCode: '상품코드',
  barcode: '바코드',
  productAbCode: '상품AB코드',
  productName: '상품명',
  salesDays: '판매일',
  orderCount: '주문수',
  orderItems: '주문건',
  orderQuantity: '주문량',
  unitPrice: '판매단가',
  totalSalesAmount: '판매가',
  cancelCount: '취소수',
  cancelQuantity: '취소량',
  cancelAmount: '취소금액',
  discountQuantity: '할인량',
  discountAmount: '할인금액',
  salesQuantity: '판매량',
  actualUnitPrice: '실판매단가',
  actualSalesAmount: '실판매금액',
  supplyPrice: '공급가액',
  vat: 'VAT',
  taxExemptAmount: '면세금액',
  totalDiscount: '전체할인',
  netSalesAmount: '순판매금액',
  vatTruncation: 'VAT절사',
  finalSupplyPrice: '최종 공급가',
  finalVat: '최종 VAT',
  paymentAmount: '결제금액',
  cashPayment: '현금결제',
  cardPayment: '카드결제',
  creditPayment: '외상결제',
  couponPayment: '쿠폰결제',
  agencyPayment: '대행결제',
  envFeeQuantity: '환경분담수량',
  envFeeAmount: '환경분담금',
  dineInOrders: '매장건',
  dineInQuantity: '매장',
  dineInSales: '매장판매',
  takeoutOrders: '포장건',
  takeoutQuantity: '포장',
  takeoutSales: '포장판매',
  deliveryOrders: '배달건',
  deliveryQuantity: '배달',
  deliverySales: '배달판매',
  royaltyRate: '로얄티율',
  royaltyAmount: '로얄티금액',
  normalSalesQty: '정상판매',
  normalUnitPrice: '정상단가',
  normalSalesAmount: '정상매상고',
  discountUnitPrice: '할인단가',
  serviceQuantity: '서비스량',
  serviceAmount: '서비스액',
  returnQuantity: '반품량',
  returnAmount: '반품액',
  serviceQuantity2: '서비스량',
  memberOrders: '회원건',
  memberOrderCount: '회원주문',
  memberSalesAmount: '회원매상고',
  customerAverage: '고객평균',
  firstCustomerAvg: '1st고객평균',
  secondCustomerAvg: '2nd고객평균',
  orderLoc: '주문LOC',
  mealTime: '식사시간',
  setQuantity: '세트수량',
  setAmount: '세트금액',
  courseQuantity: '코스수량',
  courseAmount: '코스금액',
  pointAmount: '포인트 금액',
  pointQuantity: '포인트수량',
  categorySortOrder: '분류순',
  productSortOrder: '상품순',
  totalSalesDays: '총판매일',
  categoryCode: '상품분류코드',
};

export function exportToCSV(data: ExcelProductData[], columns: ColumnConfig[]): void {
  const visibleColumns = columns.filter((c) => c.isVisible);
  const headers = visibleColumns.map((c) => FIELD_TO_KOREAN[c.key] ?? c.label);
  const rows = data.map((row) =>
    visibleColumns.map((col) => {
      const value = row[col.key as keyof ExcelProductData];
      return value ?? '';
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(',')
    ),
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analytics_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
