import * as XLSX from 'xlsx';
import type { SalesReportData, StoreChannelData, ChannelData } from './types';

const CHANNEL_NAMES = [
  '홀',
  '홀 포장',
  '홀 배달',
  '배달의민족',
  '배민 포장',
  '배민1',
  '쿠팡이츠',
  '쿠팡 포장',
  '요기요',
  '요기요 포장',
  '요기배달',
  '땡겨요',
  '땡겨요 포장',
  '배달특급',
];

const SALES_START_COL = 5;
const ORDERS_START_COL = 23;
const SALES_DAYS_START_COL = 41;
const CHANNEL_COUNT = 14;

export function parseSalesReportExcel(file: ArrayBuffer): SalesReportData {
  const workbook = XLSX.read(file, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: 0,
  });

  if (rows.length < 4) {
    throw new Error('엑셀 파일 형식이 올바르지 않습니다. 최소 4행 이상이어야 합니다.');
  }

  // Row 1 (index 1) contains period info
  const periodRow = rows[1];
  let period = '';
  if (periodRow) {
    // Try to find a date-like string in the row
    for (const cell of periodRow) {
      if (cell && typeof cell === 'string' && (cell.includes('~') || cell.includes('20'))) {
        period = cell.trim();
        break;
      }
    }
    if (!period && periodRow[0]) {
      period = String(periodRow[0]).trim();
    }
  }

  const stores: StoreChannelData[] = [];

  // Row 3+ (index 3+) contains store data
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[1]) continue;

    const storeName = String(row[1] ?? '').trim();
    if (!storeName || storeName === '합계' || storeName === '총합계' || storeName === '평균') continue;

    const storeTag = String(row[2] ?? '').trim();
    const openDate = row[3] ? String(row[3]).trim() : '';

    const channels: ChannelData[] = [];
    let totalSales = 0;
    let totalOrders = 0;
    let maxSalesDays = 0;

    for (let ch = 0; ch < CHANNEL_COUNT; ch++) {
      const sales = toNumber(row[SALES_START_COL + ch]);
      const orders = toNumber(row[ORDERS_START_COL + ch]);
      const salesDays = toNumber(row[SALES_DAYS_START_COL + ch]);

      channels.push({
        channelName: CHANNEL_NAMES[ch],
        sales,
        orders,
        salesDays,
      });

      totalSales += sales;
      totalOrders += orders;
      if (salesDays > maxSalesDays) maxSalesDays = salesDays;
    }

    // Skip rows with no data at all
    if (totalSales === 0 && totalOrders === 0) continue;

    stores.push({
      storeName,
      storeTag,
      openDate,
      channels,
      totalSales,
      totalOrders,
      totalSalesDays: maxSalesDays,
    });
  }

  if (stores.length === 0) {
    throw new Error('유효한 매장 데이터를 찾을 수 없습니다. 엑셀 형식을 확인해주세요.');
  }

  return {
    period,
    stores,
    channels: CHANNEL_NAMES,
  };
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

export { CHANNEL_NAMES };
