export interface InventoryItem {
  id: string;
  brandId: string;
  storeId: string;
  storeName: string;
  itemName: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  totalValue: number;
  supplier: string;
  lastOrderedAt: string | null;
  status: InventoryStatus;
  updatedAt: string;
}

export type InventoryStatus = 'normal' | 'low' | 'out' | 'excess';

export interface InventoryLog {
  id: string;
  inventoryId: string;
  itemName: string;
  type: InventoryLogType;
  quantity: number;
  beforeStock: number;
  afterStock: number;
  memo: string;
  createdBy: string;
  createdAt: string;
}

export type InventoryLogType = 'in' | 'out' | 'adjust';

export interface PurchaseOrder {
  id: string;
  brandId: string;
  storeId: string;
  storeName: string;
  supplier: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  orderedAt: string;
  expectedAt: string | null;
  receivedAt: string | null;
  createdAt: string;
}

export type PurchaseOrderStatus = 'draft' | 'submitted' | 'approved' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  inventoryId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface InventoryFormData {
  itemName: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  supplier: string;
}

export interface StockAdjustData {
  type: InventoryLogType;
  quantity: number;
  memo: string;
}

export interface InventoryFilters {
  search: string;
  storeId: string;
  category: string;
  status: string;
}

export interface PurchaseOrderFormData {
  storeId: string;
  supplier: string;
  items: Array<{
    inventoryId: string;
    itemName: string;
    quantity: number;
    unitCost: number;
  }>;
  expectedAt: string;
}
