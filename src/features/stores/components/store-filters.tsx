'use client';

import { Search, X, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { STORE_STATUS_MAP } from '@/constants';
import { cn } from '@/lib/utils';
import type { StoreFilters, StoreViewMode } from '../types';

interface StoreFiltersProps {
  filters: StoreFilters;
  viewMode: StoreViewMode;
  statusCounts: Record<string, number>;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: StoreFilters['status']) => void;
  onViewModeChange: (mode: StoreViewMode) => void;
}

const statusOptions = [
  { value: 'all' as const, label: '전체' },
  ...Object.entries(STORE_STATUS_MAP).map(([value, { label }]) => ({
    value: value as StoreFilters['status'],
    label,
  })),
];

export function StoreFiltersBar({
  filters,
  viewMode,
  statusCounts,
  onSearchChange,
  onStatusChange,
  onViewModeChange,
}: StoreFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            variant={filters.status === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(option.value)}
            className={cn(
              filters.status === option.value &&
                'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {option.label}
            <span className="ml-1.5 text-xs opacity-70">
              {statusCounts[option.value] ?? 0}
            </span>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="매장 검색..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[200px] pl-9 pr-8"
          />
          {filters.search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex rounded-lg border border-border">
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-9 w-9 rounded-r-none', viewMode === 'table' && 'bg-secondary')}
            onClick={() => onViewModeChange('table')}
          >
            <List size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-9 w-9 rounded-l-none', viewMode === 'grid' && 'bg-secondary')}
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
