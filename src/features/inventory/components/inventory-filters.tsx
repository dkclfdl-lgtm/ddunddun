'use client';

import { useCallback, useMemo } from 'react';
import { SearchInput } from '@/components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InventoryFilters } from '../types';
import { getCategories, getStoreOptions } from '../mock';

interface InventoryFiltersBarProps {
  filters: InventoryFilters;
  onFilterChange: <K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'normal', label: '정상' },
  { value: 'low', label: '부족' },
  { value: 'out', label: '소진' },
  { value: 'excess', label: '과잉' },
] as const;

export function InventoryFiltersBar({ filters, onFilterChange }: InventoryFiltersBarProps) {
  const categories = useMemo(() => getCategories(), []);
  const stores = useMemo(() => getStoreOptions(), []);

  const handleSearchChange = useCallback(
    (value: string) => onFilterChange('search', value),
    [onFilterChange]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput
        value={filters.search}
        onChange={handleSearchChange}
        placeholder="품목명, 공급업체, 매장명 검색..."
        className="w-full sm:w-72"
      />

      <Select
        value={filters.storeId}
        onValueChange={(value) => onFilterChange('storeId', value)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="매장 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 매장</SelectItem>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.category}
        onValueChange={(value) => onFilterChange('category', value)}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="카테고리" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 카테고리</SelectItem>
          {categories.filter(Boolean).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange('status', value)}
      >
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
