'use client';

import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { InventoryFilters, InventoryItem, InventoryLog, PurchaseOrder } from './types';
import {
  getInventoryItems,
  getInventoryItemById,
  getInventoryLogs,
  getPurchaseOrders,
  adjustStock,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  getStoreOptions,
} from './mock';
import { inventoryFormSchema, stockAdjustSchema, type InventoryFormValues, type StockAdjustValues } from './schema';

export function useInventoryList(initialFilters?: Partial<InventoryFilters>) {
  const [items, setItems] = useState<InventoryItem[]>(() => getInventoryItems());
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    storeId: 'all',
    category: 'all',
    status: 'all',
    ...initialFilters,
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !filters.search ||
        item.itemName.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.supplier.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.storeName.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStore = filters.storeId === 'all' || item.storeId === filters.storeId;
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      const matchesStatus = filters.status === 'all' || item.status === filters.status;
      return matchesSearch && matchesStore && matchesCategory && matchesStatus;
    });
  }, [items, filters]);

  const updateFilter = useCallback(<K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeItem = useCallback((id: string) => {
    deleteInventoryItem(id);
    setItems(getInventoryItems());
  }, []);

  const refreshItems = useCallback(() => {
    setItems(getInventoryItems());
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { all: items.length, normal: 0, low: 0, out: 0, excess: 0 };
    items.forEach((item) => {
      counts[item.status]++;
    });
    return counts;
  }, [items]);

  return {
    items: filteredItems,
    allItems: items,
    filters,
    updateFilter,
    removeItem,
    refreshItems,
    statusCounts,
  };
}

export function useInventoryDetail(itemId: string) {
  const [item] = useState<InventoryItem | undefined>(() => getInventoryItemById(itemId));
  const [logs] = useState<InventoryLog[]>(() => getInventoryLogs(itemId));

  return { item, logs };
}

export function useInventoryForm(itemId?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const existingItem = itemId ? getInventoryItemById(itemId) : undefined;

  const defaultValues: InventoryFormValues = existingItem
    ? {
        itemName: existingItem.itemName,
        category: existingItem.category,
        unit: existingItem.unit,
        currentStock: existingItem.currentStock,
        minStock: existingItem.minStock,
        maxStock: existingItem.maxStock,
        unitCost: existingItem.unitCost,
        supplier: existingItem.supplier,
      }
    : {
        itemName: '',
        category: '',
        unit: '',
        currentStock: 0,
        minStock: 0,
        maxStock: 100,
        unitCost: 0,
        supplier: '',
      };

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues,
  });

  const submitItem = useCallback(
    async (data: InventoryFormValues, storeId: string = 'store-1'): Promise<InventoryItem> => {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      let result: InventoryItem;
      if (existingItem) {
        const updated = updateInventoryItem(existingItem.id, data);
        result = updated ?? existingItem;
      } else {
        const store = getStoreOptions().find((s) => s.id === storeId);
        result = createInventoryItem({
          itemName: data.itemName,
          category: data.category,
          unit: data.unit,
          currentStock: data.currentStock,
          minStock: data.minStock,
          maxStock: data.maxStock,
          unitCost: data.unitCost,
          supplier: data.supplier,
          brandId: 'brand-1',
          storeId,
          storeName: store?.name ?? '',
          lastOrderedAt: null,
        });
      }

      setIsSubmitting(false);
      return result;
    },
    [existingItem]
  );

  return { form, isSubmitting, submitItem, isEditing: !!itemId };
}

export function useStockAdjust() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StockAdjustValues>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: {
      type: 'in',
      quantity: 1,
      memo: '',
    },
  });

  const submitAdjust = useCallback(
    async (itemId: string, data: StockAdjustValues): Promise<InventoryLog | undefined> => {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const log = adjustStock(itemId, data.type, data.quantity, data.memo);
      setIsSubmitting(false);
      return log;
    },
    []
  );

  return { form, isSubmitting, submitAdjust };
}

export function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(() => getPurchaseOrders());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const createOrder = useCallback(
    (data: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
      createPurchaseOrder(data);
      setOrders(getPurchaseOrders());
    },
    []
  );

  const updateStatus = useCallback(
    (id: string, status: PurchaseOrder['status']) => {
      updatePurchaseOrderStatus(id, status);
      setOrders(getPurchaseOrders());
    },
    []
  );

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length, draft: 0, submitted: 0, approved: 0, received: 0, cancelled: 0 };
    orders.forEach((o) => {
      counts[o.status]++;
    });
    return counts;
  }, [orders]);

  return {
    orders: filteredOrders,
    allOrders: orders,
    statusFilter,
    setStatusFilter,
    createOrder,
    updateStatus,
    statusCounts,
  };
}

export function useInventoryAlerts() {
  const items = useMemo(() => getInventoryItems(), []);

  const lowStockItems = useMemo(
    () => items.filter((item) => item.status === 'low'),
    [items]
  );

  const outOfStockItems = useMemo(
    () => items.filter((item) => item.status === 'out'),
    [items]
  );

  const excessStockItems = useMemo(
    () => items.filter((item) => item.status === 'excess'),
    [items]
  );

  const alertCount = lowStockItems.length + outOfStockItems.length;

  return { lowStockItems, outOfStockItems, excessStockItems, alertCount };
}
