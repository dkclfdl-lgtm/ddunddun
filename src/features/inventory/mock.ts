import type {
  InventoryItem,
  InventoryLog,
  PurchaseOrder,
  InventoryStatus,
} from './types';

const CATEGORIES = ['주류원료', '식자재', '포장재', '소모품', '조미료', '음료원료'] as const;

const STORES = [
  { id: 'store-1', name: '강남점' },
  { id: 'store-2', name: '홍대점' },
  { id: 'store-3', name: '명동점' },
  { id: 'store-4', name: '잠실점' },
  { id: 'store-5', name: '신촌점' },
] as const;

function computeStatus(current: number, min: number, max: number): InventoryStatus {
  if (current === 0) return 'out';
  if (current <= min) return 'low';
  if (current > max) return 'excess';
  return 'normal';
}

export const mockInventoryItems: InventoryItem[] = [
  // 주류원료
  { id: 'inv-1', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '소주 (참이슬)', category: '주류원료', unit: '병', currentStock: 120, minStock: 50, maxStock: 300, unitCost: 1100, totalValue: 132000, supplier: '하이트진로', lastOrderedAt: '2026-03-10', status: 'normal', updatedAt: '2026-03-14T09:00:00Z' },
  { id: 'inv-2', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '맥주 (카스)', category: '주류원료', unit: '병', currentStock: 80, minStock: 40, maxStock: 200, unitCost: 1800, totalValue: 144000, supplier: 'OB맥주', lastOrderedAt: '2026-03-08', status: 'normal', updatedAt: '2026-03-14T09:00:00Z' },
  { id: 'inv-3', brandId: 'brand-1', storeId: 'store-2', storeName: '홍대점', itemName: '소주 (참이슬)', category: '주류원료', unit: '병', currentStock: 15, minStock: 50, maxStock: 300, unitCost: 1100, totalValue: 16500, supplier: '하이트진로', lastOrderedAt: '2026-03-05', status: 'low', updatedAt: '2026-03-14T10:00:00Z' },
  { id: 'inv-4', brandId: 'brand-1', storeId: 'store-2', storeName: '홍대점', itemName: '맥주 (카스)', category: '주류원료', unit: '병', currentStock: 0, minStock: 40, maxStock: 200, unitCost: 1800, totalValue: 0, supplier: 'OB맥주', lastOrderedAt: '2026-02-28', status: 'out', updatedAt: '2026-03-14T10:00:00Z' },
  { id: 'inv-5', brandId: 'brand-1', storeId: 'store-3', storeName: '명동점', itemName: '소주 (참이슬)', category: '주류원료', unit: '병', currentStock: 350, minStock: 50, maxStock: 300, unitCost: 1100, totalValue: 385000, supplier: '하이트진로', lastOrderedAt: '2026-03-12', status: 'excess', updatedAt: '2026-03-14T11:00:00Z' },
  { id: 'inv-6', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '와인 (레드)', category: '주류원료', unit: '병', currentStock: 25, minStock: 10, maxStock: 50, unitCost: 15000, totalValue: 375000, supplier: '와인수입사', lastOrderedAt: '2026-03-01', status: 'normal', updatedAt: '2026-03-13T09:00:00Z' },

  // 식자재
  { id: 'inv-7', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '삼겹살', category: '식자재', unit: 'kg', currentStock: 45, minStock: 20, maxStock: 100, unitCost: 18000, totalValue: 810000, supplier: '한우축산', lastOrderedAt: '2026-03-13', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-8', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '목살', category: '식자재', unit: 'kg', currentStock: 30, minStock: 15, maxStock: 80, unitCost: 16000, totalValue: 480000, supplier: '한우축산', lastOrderedAt: '2026-03-13', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-9', brandId: 'brand-1', storeId: 'store-2', storeName: '홍대점', itemName: '삼겹살', category: '식자재', unit: 'kg', currentStock: 5, minStock: 20, maxStock: 100, unitCost: 18000, totalValue: 90000, supplier: '한우축산', lastOrderedAt: '2026-03-10', status: 'low', updatedAt: '2026-03-14T10:00:00Z' },
  { id: 'inv-10', brandId: 'brand-1', storeId: 'store-3', storeName: '명동점', itemName: '삼겹살', category: '식자재', unit: 'kg', currentStock: 60, minStock: 20, maxStock: 100, unitCost: 18000, totalValue: 1080000, supplier: '한우축산', lastOrderedAt: '2026-03-12', status: 'normal', updatedAt: '2026-03-14T11:00:00Z' },
  { id: 'inv-11', brandId: 'brand-1', storeId: 'store-4', storeName: '잠실점', itemName: '삼겹살', category: '식자재', unit: 'kg', currentStock: 0, minStock: 20, maxStock: 100, unitCost: 18000, totalValue: 0, supplier: '한우축산', lastOrderedAt: '2026-03-08', status: 'out', updatedAt: '2026-03-14T12:00:00Z' },
  { id: 'inv-12', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '양파', category: '식자재', unit: 'kg', currentStock: 25, minStock: 10, maxStock: 50, unitCost: 2500, totalValue: 62500, supplier: '신선농산', lastOrderedAt: '2026-03-12', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-13', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '마늘', category: '식자재', unit: 'kg', currentStock: 8, minStock: 5, maxStock: 30, unitCost: 8000, totalValue: 64000, supplier: '신선농산', lastOrderedAt: '2026-03-11', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-14', brandId: 'brand-1', storeId: 'store-2', storeName: '홍대점', itemName: '양파', category: '식자재', unit: 'kg', currentStock: 3, minStock: 10, maxStock: 50, unitCost: 2500, totalValue: 7500, supplier: '신선농산', lastOrderedAt: '2026-03-07', status: 'low', updatedAt: '2026-03-14T10:00:00Z' },
  { id: 'inv-15', brandId: 'brand-1', storeId: 'store-5', storeName: '신촌점', itemName: '삼겹살', category: '식자재', unit: 'kg', currentStock: 35, minStock: 20, maxStock: 100, unitCost: 18000, totalValue: 630000, supplier: '한우축산', lastOrderedAt: '2026-03-11', status: 'normal', updatedAt: '2026-03-14T13:00:00Z' },

  // 포장재
  { id: 'inv-16', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '테이크아웃 용기 (대)', category: '포장재', unit: '개', currentStock: 500, minStock: 200, maxStock: 2000, unitCost: 350, totalValue: 175000, supplier: '클린팩', lastOrderedAt: '2026-03-05', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-17', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '테이크아웃 용기 (소)', category: '포장재', unit: '개', currentStock: 150, minStock: 200, maxStock: 2000, unitCost: 250, totalValue: 37500, supplier: '클린팩', lastOrderedAt: '2026-03-05', status: 'low', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-18', brandId: 'brand-1', storeId: 'store-2', storeName: '홍대점', itemName: '테이크아웃 용기 (대)', category: '포장재', unit: '개', currentStock: 80, minStock: 200, maxStock: 2000, unitCost: 350, totalValue: 28000, supplier: '클린팩', lastOrderedAt: '2026-03-01', status: 'low', updatedAt: '2026-03-14T10:00:00Z' },
  { id: 'inv-19', brandId: 'brand-1', storeId: 'store-3', storeName: '명동점', itemName: '비닐봉투 (대)', category: '포장재', unit: '장', currentStock: 1500, minStock: 500, maxStock: 3000, unitCost: 50, totalValue: 75000, supplier: '클린팩', lastOrderedAt: '2026-03-10', status: 'normal', updatedAt: '2026-03-14T11:00:00Z' },

  // 소모품
  { id: 'inv-20', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '냅킨', category: '소모품', unit: '묶음', currentStock: 30, minStock: 10, maxStock: 100, unitCost: 5000, totalValue: 150000, supplier: '오피스디포', lastOrderedAt: '2026-03-02', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-21', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '물티슈', category: '소모품', unit: '팩', currentStock: 50, minStock: 20, maxStock: 150, unitCost: 1500, totalValue: 75000, supplier: '오피스디포', lastOrderedAt: '2026-03-02', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-22', brandId: 'brand-1', storeId: 'store-2', storeName: '홍대점', itemName: '냅킨', category: '소모품', unit: '묶음', currentStock: 2, minStock: 10, maxStock: 100, unitCost: 5000, totalValue: 10000, supplier: '오피스디포', lastOrderedAt: '2026-02-25', status: 'low', updatedAt: '2026-03-14T10:00:00Z' },
  { id: 'inv-23', brandId: 'brand-1', storeId: 'store-4', storeName: '잠실점', itemName: '일회용 장갑', category: '소모품', unit: '박스', currentStock: 0, minStock: 5, maxStock: 30, unitCost: 8000, totalValue: 0, supplier: '오피스디포', lastOrderedAt: '2026-02-20', status: 'out', updatedAt: '2026-03-14T12:00:00Z' },

  // 조미료
  { id: 'inv-24', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '소금', category: '조미료', unit: 'kg', currentStock: 15, minStock: 5, maxStock: 30, unitCost: 3000, totalValue: 45000, supplier: '신선농산', lastOrderedAt: '2026-03-08', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-25', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '후추', category: '조미료', unit: 'g', currentStock: 500, minStock: 200, maxStock: 2000, unitCost: 30, totalValue: 15000, supplier: '신선농산', lastOrderedAt: '2026-03-08', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-26', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '참기름', category: '조미료', unit: 'ml', currentStock: 2000, minStock: 500, maxStock: 5000, unitCost: 15, totalValue: 30000, supplier: '신선농산', lastOrderedAt: '2026-03-06', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-27', brandId: 'brand-1', storeId: 'store-3', storeName: '명동점', itemName: '쌈장', category: '조미료', unit: 'kg', currentStock: 12, minStock: 5, maxStock: 25, unitCost: 6000, totalValue: 72000, supplier: '신선농산', lastOrderedAt: '2026-03-09', status: 'normal', updatedAt: '2026-03-14T11:00:00Z' },

  // 음료원료
  { id: 'inv-28', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '콜라 시럽', category: '음료원료', unit: 'L', currentStock: 20, minStock: 10, maxStock: 50, unitCost: 12000, totalValue: 240000, supplier: '코카콜라', lastOrderedAt: '2026-03-07', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-29', brandId: 'brand-1', storeId: 'store-1', storeName: '강남점', itemName: '사이다 시럽', category: '음료원료', unit: 'L', currentStock: 18, minStock: 10, maxStock: 50, unitCost: 11000, totalValue: 198000, supplier: '롯데칠성', lastOrderedAt: '2026-03-07', status: 'normal', updatedAt: '2026-03-14T08:00:00Z' },
  { id: 'inv-30', brandId: 'brand-1', storeId: 'store-2', storeName: '홍대점', itemName: '콜라 시럽', category: '음료원료', unit: 'L', currentStock: 3, minStock: 10, maxStock: 50, unitCost: 12000, totalValue: 36000, supplier: '코카콜라', lastOrderedAt: '2026-03-01', status: 'low', updatedAt: '2026-03-14T10:00:00Z' },
  { id: 'inv-31', brandId: 'brand-1', storeId: 'store-4', storeName: '잠실점', itemName: '탄산수', category: '음료원료', unit: '병', currentStock: 200, minStock: 50, maxStock: 150, unitCost: 800, totalValue: 160000, supplier: '롯데칠성', lastOrderedAt: '2026-03-12', status: 'excess', updatedAt: '2026-03-14T12:00:00Z' },
  { id: 'inv-32', brandId: 'brand-1', storeId: 'store-5', storeName: '신촌점', itemName: '오렌지 주스', category: '음료원료', unit: 'L', currentStock: 10, minStock: 5, maxStock: 30, unitCost: 8000, totalValue: 80000, supplier: '델몬트', lastOrderedAt: '2026-03-09', status: 'normal', updatedAt: '2026-03-14T13:00:00Z' },
];

export const mockInventoryLogs: InventoryLog[] = [
  { id: 'log-1', inventoryId: 'inv-1', itemName: '소주 (참이슬)', type: 'in', quantity: 100, beforeStock: 20, afterStock: 120, memo: '정기 발주 입고', createdBy: '김매니저', createdAt: '2026-03-14T09:00:00Z' },
  { id: 'log-2', inventoryId: 'inv-7', itemName: '삼겹살', type: 'in', quantity: 30, beforeStock: 15, afterStock: 45, memo: '긴급 발주 입고', createdBy: '김매니저', createdAt: '2026-03-14T08:30:00Z' },
  { id: 'log-3', inventoryId: 'inv-3', itemName: '소주 (참이슬)', type: 'out', quantity: 35, beforeStock: 50, afterStock: 15, memo: '일일 사용', createdBy: '박직원', createdAt: '2026-03-14T10:00:00Z' },
  { id: 'log-4', inventoryId: 'inv-4', itemName: '맥주 (카스)', type: 'out', quantity: 20, beforeStock: 20, afterStock: 0, memo: '일일 사용 - 재고 소진', createdBy: '박직원', createdAt: '2026-03-14T10:30:00Z' },
  { id: 'log-5', inventoryId: 'inv-5', itemName: '소주 (참이슬)', type: 'in', quantity: 200, beforeStock: 150, afterStock: 350, memo: '대량 발주 입고', createdBy: '이점장', createdAt: '2026-03-14T11:00:00Z' },
  { id: 'log-6', inventoryId: 'inv-9', itemName: '삼겹살', type: 'out', quantity: 25, beforeStock: 30, afterStock: 5, memo: '금요일 매출 증가로 사용량 증가', createdBy: '박직원', createdAt: '2026-03-13T22:00:00Z' },
  { id: 'log-7', inventoryId: 'inv-11', itemName: '삼겹살', type: 'out', quantity: 18, beforeStock: 18, afterStock: 0, memo: '재고 전량 소진', createdBy: '최매니저', createdAt: '2026-03-13T21:00:00Z' },
  { id: 'log-8', inventoryId: 'inv-16', itemName: '테이크아웃 용기 (대)', type: 'in', quantity: 300, beforeStock: 200, afterStock: 500, memo: '정기 발주 입고', createdBy: '김매니저', createdAt: '2026-03-13T09:00:00Z' },
  { id: 'log-9', inventoryId: 'inv-20', itemName: '냅킨', type: 'adjust', quantity: -5, beforeStock: 35, afterStock: 30, memo: '재고 실사 결과 조정', createdBy: '김매니저', createdAt: '2026-03-12T18:00:00Z' },
  { id: 'log-10', inventoryId: 'inv-17', itemName: '테이크아웃 용기 (소)', type: 'out', quantity: 100, beforeStock: 250, afterStock: 150, memo: '배달 주문 포장', createdBy: '김매니저', createdAt: '2026-03-12T15:00:00Z' },
  { id: 'log-11', inventoryId: 'inv-22', itemName: '냅킨', type: 'out', quantity: 8, beforeStock: 10, afterStock: 2, memo: '일일 사용', createdBy: '박직원', createdAt: '2026-03-12T20:00:00Z' },
  { id: 'log-12', inventoryId: 'inv-28', itemName: '콜라 시럽', type: 'in', quantity: 10, beforeStock: 10, afterStock: 20, memo: '정기 입고', createdBy: '김매니저', createdAt: '2026-03-11T09:00:00Z' },
  { id: 'log-13', inventoryId: 'inv-23', itemName: '일회용 장갑', type: 'out', quantity: 3, beforeStock: 3, afterStock: 0, memo: '전량 소진', createdBy: '최매니저', createdAt: '2026-03-11T17:00:00Z' },
  { id: 'log-14', inventoryId: 'inv-30', itemName: '콜라 시럽', type: 'out', quantity: 7, beforeStock: 10, afterStock: 3, memo: '주말 사용', createdBy: '박직원', createdAt: '2026-03-10T22:00:00Z' },
  { id: 'log-15', inventoryId: 'inv-31', itemName: '탄산수', type: 'in', quantity: 150, beforeStock: 50, afterStock: 200, memo: '대량 입고', createdBy: '최매니저', createdAt: '2026-03-12T10:00:00Z' },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    brandId: 'brand-1',
    storeId: 'store-1',
    storeName: '강남점',
    supplier: '한우축산',
    items: [
      { inventoryId: 'inv-7', itemName: '삼겹살', quantity: 30, unitCost: 18000, totalCost: 540000 },
      { inventoryId: 'inv-8', itemName: '목살', quantity: 20, unitCost: 16000, totalCost: 320000 },
    ],
    totalAmount: 860000,
    status: 'received',
    orderedAt: '2026-03-12T09:00:00Z',
    expectedAt: '2026-03-13',
    receivedAt: '2026-03-13T08:00:00Z',
    createdAt: '2026-03-12T09:00:00Z',
  },
  {
    id: 'po-2',
    brandId: 'brand-1',
    storeId: 'store-2',
    storeName: '홍대점',
    supplier: '하이트진로',
    items: [
      { inventoryId: 'inv-3', itemName: '소주 (참이슬)', quantity: 100, unitCost: 1100, totalCost: 110000 },
    ],
    totalAmount: 110000,
    status: 'approved',
    orderedAt: '2026-03-14T10:00:00Z',
    expectedAt: '2026-03-16',
    receivedAt: null,
    createdAt: '2026-03-14T10:00:00Z',
  },
  {
    id: 'po-3',
    brandId: 'brand-1',
    storeId: 'store-2',
    storeName: '홍대점',
    supplier: 'OB맥주',
    items: [
      { inventoryId: 'inv-4', itemName: '맥주 (카스)', quantity: 80, unitCost: 1800, totalCost: 144000 },
    ],
    totalAmount: 144000,
    status: 'submitted',
    orderedAt: '2026-03-14T11:00:00Z',
    expectedAt: '2026-03-17',
    receivedAt: null,
    createdAt: '2026-03-14T11:00:00Z',
  },
  {
    id: 'po-4',
    brandId: 'brand-1',
    storeId: 'store-4',
    storeName: '잠실점',
    supplier: '한우축산',
    items: [
      { inventoryId: 'inv-11', itemName: '삼겹살', quantity: 50, unitCost: 18000, totalCost: 900000 },
    ],
    totalAmount: 900000,
    status: 'draft',
    orderedAt: '2026-03-14T12:00:00Z',
    expectedAt: '2026-03-18',
    receivedAt: null,
    createdAt: '2026-03-14T12:00:00Z',
  },
  {
    id: 'po-5',
    brandId: 'brand-1',
    storeId: 'store-3',
    storeName: '명동점',
    supplier: '클린팩',
    items: [
      { inventoryId: 'inv-19', itemName: '비닐봉투 (대)', quantity: 1000, unitCost: 50, totalCost: 50000 },
    ],
    totalAmount: 50000,
    status: 'cancelled',
    orderedAt: '2026-03-10T09:00:00Z',
    expectedAt: '2026-03-12',
    receivedAt: null,
    createdAt: '2026-03-10T09:00:00Z',
  },
];

// CRUD helpers
let inventoryItems = [...mockInventoryItems];
let inventoryLogs = [...mockInventoryLogs];
let purchaseOrders = [...mockPurchaseOrders];

export function getInventoryItems(): InventoryItem[] {
  return inventoryItems;
}

export function getInventoryItemById(id: string): InventoryItem | undefined {
  return inventoryItems.find((item) => item.id === id);
}

export function getInventoryItemsByStore(storeId: string): InventoryItem[] {
  return inventoryItems.filter((item) => item.storeId === storeId);
}

export function createInventoryItem(data: Omit<InventoryItem, 'id' | 'totalValue' | 'status' | 'updatedAt'>): InventoryItem {
  const newItem: InventoryItem = {
    ...data,
    id: `inv-${Date.now()}`,
    totalValue: data.currentStock * data.unitCost,
    status: computeStatus(data.currentStock, data.minStock, data.maxStock),
    updatedAt: new Date().toISOString(),
  };
  inventoryItems = [...inventoryItems, newItem];
  return newItem;
}

export function updateInventoryItem(id: string, data: Partial<InventoryItem>): InventoryItem | undefined {
  const index = inventoryItems.findIndex((item) => item.id === id);
  if (index === -1) return undefined;
  const updated = { ...inventoryItems[index], ...data, updatedAt: new Date().toISOString() };
  if (data.currentStock !== undefined || data.unitCost !== undefined) {
    updated.totalValue = updated.currentStock * updated.unitCost;
    updated.status = computeStatus(updated.currentStock, updated.minStock, updated.maxStock);
  }
  inventoryItems = inventoryItems.map((item, i) => (i === index ? updated : item));
  return updated;
}

export function deleteInventoryItem(id: string): boolean {
  const before = inventoryItems.length;
  inventoryItems = inventoryItems.filter((item) => item.id !== id);
  return inventoryItems.length < before;
}

export function adjustStock(id: string, type: 'in' | 'out' | 'adjust', quantity: number, memo: string): InventoryLog | undefined {
  const item = inventoryItems.find((i) => i.id === id);
  if (!item) return undefined;

  const beforeStock = item.currentStock;
  let afterStock: number;

  if (type === 'in') {
    afterStock = beforeStock + quantity;
  } else if (type === 'out') {
    afterStock = Math.max(0, beforeStock - quantity);
  } else {
    afterStock = Math.max(0, beforeStock + quantity);
  }

  updateInventoryItem(id, { currentStock: afterStock });

  const log: InventoryLog = {
    id: `log-${Date.now()}`,
    inventoryId: id,
    itemName: item.itemName,
    type,
    quantity,
    beforeStock,
    afterStock,
    memo,
    createdBy: '현재 사용자',
    createdAt: new Date().toISOString(),
  };
  inventoryLogs = [log, ...inventoryLogs];
  return log;
}

export function getInventoryLogs(inventoryId?: string): InventoryLog[] {
  if (inventoryId) {
    return inventoryLogs.filter((log) => log.inventoryId === inventoryId);
  }
  return inventoryLogs;
}

export function getPurchaseOrders(): PurchaseOrder[] {
  return purchaseOrders;
}

export function getPurchaseOrderById(id: string): PurchaseOrder | undefined {
  return purchaseOrders.find((o) => o.id === id);
}

export function createPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'createdAt'>): PurchaseOrder {
  const order: PurchaseOrder = {
    ...data,
    id: `po-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  purchaseOrders = [order, ...purchaseOrders];
  return order;
}

export function updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status']): PurchaseOrder | undefined {
  const index = purchaseOrders.findIndex((o) => o.id === id);
  if (index === -1) return undefined;
  const updated = {
    ...purchaseOrders[index],
    status,
    receivedAt: status === 'received' ? new Date().toISOString() : purchaseOrders[index].receivedAt,
  };
  purchaseOrders = purchaseOrders.map((o, i) => (i === index ? updated : o));
  return updated;
}

export function getCategories(): string[] {
  return [...CATEGORIES];
}

export function getStoreOptions(): Array<{ id: string; name: string }> {
  return [...STORES];
}
