'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Store } from '@/types';
import type { StoreFilters, StoreViewMode, StoreWithOwner } from './types';
import { mockStoresDetailed, getMockStoreById, createMockStore } from './mock';
import type { StoreFormValues } from './schema';

export function useStoreList() {
  const [stores, setStores] = useState<StoreWithOwner[]>(mockStoresDetailed);
  const [filters, setFilters] = useState<StoreFilters>({ search: '', status: 'all' });
  const [viewMode, setViewMode] = useState<StoreViewMode>('table');

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        !filters.search ||
        store.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        store.address.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'all' || store.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [stores, filters]);

  const updateSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const updateStatus = useCallback((status: StoreFilters['status']) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const deleteStore = useCallback((id: string) => {
    setStores((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { all: stores.length, active: 0, inactive: 0, closed: 0, preparing: 0 };
    stores.forEach((s) => {
      counts[s.status]++;
    });
    return counts;
  }, [stores]);

  return {
    stores: filteredStores,
    allStores: stores,
    filters,
    viewMode,
    setViewMode,
    updateSearch,
    updateStatus,
    deleteStore,
    statusCounts,
  };
}

export function useStoreDetail(storeId: string) {
  const [store] = useState<StoreWithOwner | undefined>(() => getMockStoreById(storeId));
  const [isLoading] = useState(false);

  return { store, isLoading };
}

export function useStoreForm(storeId?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const existingStore = storeId ? getMockStoreById(storeId) : undefined;

  const defaultValues: StoreFormValues = existingStore
    ? {
        name: existingStore.name,
        address: existingStore.address,
        phone: existingStore.phone ?? '',
        status: existingStore.status,
        opening_date: existingStore.opening_date ?? '',
        owner_id: existingStore.owner_id ?? '',
        lat: existingStore.lat,
        lng: existingStore.lng,
      }
    : {
        name: '',
        address: '',
        phone: '',
        status: 'preparing',
        opening_date: '',
        owner_id: '',
        lat: null,
        lng: null,
      };

  const submitStore = useCallback(
    async (data: StoreFormValues): Promise<Store> => {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const store = createMockStore({
        ...data,
        phone: data.phone || null,
        opening_date: data.opening_date || null,
        owner_id: data.owner_id || null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
      });
      setIsSubmitting(false);
      return store;
    },
    [],
  );

  return { defaultValues, isSubmitting, submitStore, isEditing: !!storeId };
}
