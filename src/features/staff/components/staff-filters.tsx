'use client';

import { useCallback } from 'react';
import { SearchInput } from '@/components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StaffFilters } from '../types';

interface StaffFiltersBarProps {
  filters: StaffFilters;
  onFilterChange: <K extends keyof StaffFilters>(key: K, value: StaffFilters[K]) => void;
}

const storeOptions = [
  { value: 'all', label: '전체 매장' },
  { value: 'store-1', label: '강남점' },
  { value: 'store-2', label: '홍대점' },
  { value: 'store-3', label: '명동점' },
  { value: 'store-4', label: '잠실점' },
  { value: 'store-5', label: '신촌점' },
];

const roleOptions = [
  { value: 'all', label: '전체 역할' },
  { value: 'manager', label: '매니저' },
  { value: 'cook', label: '주방' },
  { value: 'server', label: '서빙' },
  { value: 'part_time', label: '파트타임' },
  { value: 'delivery', label: '배달' },
];

const statusOptions = [
  { value: 'all', label: '전체 상태' },
  { value: 'active', label: '재직중' },
  { value: 'inactive', label: '퇴직' },
  { value: 'on_leave', label: '휴직' },
];

export function StaffFiltersBar({ filters, onFilterChange }: StaffFiltersBarProps) {
  const handleSearchChange = useCallback(
    (value: string) => onFilterChange('search', value),
    [onFilterChange]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="w-full sm:w-64">
        <SearchInput
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="이름, 연락처, 이메일 검색..."
        />
      </div>

      <Select value={filters.storeId} onValueChange={(v) => onFilterChange('storeId', v)}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {storeOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.role} onValueChange={(v) => onFilterChange('role', v)}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(v) => onFilterChange('status', v)}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
