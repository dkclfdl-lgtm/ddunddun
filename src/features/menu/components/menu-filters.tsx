'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchInput } from '@/components/common';
import type { MenuCategory, MenuFilters, MenuViewMode } from '../types';

interface MenuFiltersBarProps {
  filters: MenuFilters;
  categories: MenuCategory[];
  viewMode: MenuViewMode;
  onSearchChange: (search: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onAvailabilityChange: (isAvailable: boolean | null) => void;
  onViewModeChange: (mode: MenuViewMode) => void;
}

export function MenuFiltersBar({
  filters,
  categories,
  viewMode,
  onSearchChange,
  onCategoryChange,
  onAvailabilityChange,
  onViewModeChange,
}: MenuFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <SearchInput
          value={filters.search}
          onChange={onSearchChange}
          placeholder="메뉴명 또는 코드 검색..."
          className="w-full sm:max-w-xs"
        />

        <Select
          value={filters.categoryId || 'all'}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {categories
              .filter((c) => c.isActive)
              .map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.isAvailable === null ? 'all' : filters.isAvailable ? 'available' : 'unavailable'}
          onValueChange={(val) => {
            if (val === 'all') onAvailabilityChange(null);
            else if (val === 'available') onAvailabilityChange(true);
            else onAvailabilityChange(false);
          }}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="available">판매중</SelectItem>
            <SelectItem value="unavailable">품절</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1 border rounded-md p-0.5">
        <Button
          variant={viewMode === 'table' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('table')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
