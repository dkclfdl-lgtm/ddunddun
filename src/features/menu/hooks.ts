'use client';

import { useState, useMemo, useCallback } from 'react';
import type { MenuCategory, MenuItem, MenuFilters, MenuFormData, CategoryFormData } from './types';
import {
  getMenuCategories,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from './mock';
import type { MenuFormValues } from './schema';

export function useMenuCategories() {
  const [categories, setCategories] = useState<MenuCategory[]>(() => getMenuCategories());

  const refreshCategories = useCallback(() => {
    setCategories(getMenuCategories());
  }, []);

  const handleCreateCategory = useCallback((data: CategoryFormData) => {
    const newCat = createCategory(data);
    setCategories(getMenuCategories());
    return newCat;
  }, []);

  const handleUpdateCategory = useCallback((id: string, data: Partial<CategoryFormData>) => {
    const updated = updateCategory(id, data);
    setCategories(getMenuCategories());
    return updated;
  }, []);

  const handleDeleteCategory = useCallback((id: string) => {
    const success = deleteCategory(id);
    if (success) {
      setCategories(getMenuCategories());
    }
    return success;
  }, []);

  const handleReorderCategories = useCallback((orderedIds: string[]) => {
    const reordered = reorderCategories(orderedIds);
    setCategories(reordered);
  }, []);

  const handleToggleActive = useCallback((id: string, isActive: boolean) => {
    updateCategory(id, { isActive });
    setCategories(getMenuCategories());
  }, []);

  const activeCount = useMemo(() => categories.filter((c) => c.isActive).length, [categories]);
  const totalItems = useMemo(() => categories.reduce((sum, c) => sum + c.itemCount, 0), [categories]);

  return {
    categories,
    activeCount,
    totalItems,
    refreshCategories,
    createCategory: handleCreateCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    reorderCategories: handleReorderCategories,
    toggleActive: handleToggleActive,
  };
}

export function useMenuItems(filters?: MenuFilters) {
  const [items, setItems] = useState<MenuItem[]>(() => getMenuItems());

  const filteredItems = useMemo(() => {
    if (!filters) return items;

    return items.filter((item) => {
      const matchesSearch =
        !filters.search ||
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.code.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        !filters.categoryId || filters.categoryId === 'all' || item.categoryId === filters.categoryId;

      const matchesAvailability =
        filters.isAvailable === null || item.isAvailable === filters.isAvailable;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [items, filters]);

  const refreshItems = useCallback(() => {
    setItems(getMenuItems());
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    const success = deleteMenuItem(id);
    if (success) {
      setItems(getMenuItems());
    }
    return success;
  }, []);

  const handleToggleAvailable = useCallback((id: string, isAvailable: boolean) => {
    updateMenuItem(id, { isAvailable });
    setItems(getMenuItems());
  }, []);

  const handleTogglePopular = useCallback((id: string, isPopular: boolean) => {
    updateMenuItem(id, { isPopular });
    setItems(getMenuItems());
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.isAvailable).length;
    const unavailable = total - available;
    const popular = items.filter((i) => i.isPopular).length;
    return { total, available, unavailable, popular };
  }, [items]);

  return {
    items: filteredItems,
    allItems: items,
    stats,
    refreshItems,
    deleteItem: handleDeleteItem,
    toggleAvailable: handleToggleAvailable,
    togglePopular: handleTogglePopular,
  };
}

export function useMenuItemDetail(itemId: string) {
  const [item] = useState<MenuItem | undefined>(() => getMenuItemById(itemId));
  const [isLoading] = useState(false);

  const averageDailyRevenue = useMemo(() => {
    if (!item) return 0;
    // 가정: 약 180일 영업
    return Math.round(item.revenue / 180);
  }, [item]);

  return { item, isLoading, averageDailyRevenue };
}

export function useMenuForm(itemId?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const existingItem = itemId ? getMenuItemById(itemId) : undefined;

  const defaultValues: MenuFormValues = existingItem
    ? {
        categoryId: existingItem.categoryId,
        name: existingItem.name,
        code: existingItem.code,
        price: existingItem.price,
        costPrice: existingItem.costPrice,
        description: existingItem.description,
        isAvailable: existingItem.isAvailable,
        isPopular: existingItem.isPopular,
      }
    : {
        categoryId: '',
        name: '',
        code: '',
        price: 0,
        costPrice: 0,
        description: '',
        isAvailable: true,
        isPopular: false,
      };

  const submitItem = useCallback(
    async (data: MenuFormValues): Promise<MenuItem> => {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      let result: MenuItem;
      if (itemId && existingItem) {
        const updated = updateMenuItem(itemId, data as MenuFormData);
        result = updated ?? existingItem;
      } else {
        result = createMenuItem(data as MenuFormData);
      }

      setIsSubmitting(false);
      return result;
    },
    [itemId, existingItem]
  );

  return { defaultValues, isSubmitting, submitItem, isEditing: !!itemId };
}
