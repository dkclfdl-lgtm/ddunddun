'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InspectionFilters } from '../types';
import { mockTemplates } from '../mock';

const storeOptions = [
  { value: 'all', label: '전체 매장' },
  { value: 'store-1', label: '강남점' },
  { value: 'store-2', label: '홍대점' },
  { value: 'store-3', label: '명동점' },
  { value: 'store-4', label: '잠실점' },
  { value: 'store-5', label: '신촌점' },
  { value: 'store-7', label: '건대점' },
  { value: 'store-8', label: '여의도점' },
];

interface InspectionFiltersBarProps {
  filters: InspectionFilters;
  onFiltersChange: (partial: Partial<InspectionFilters>) => void;
}

export function InspectionFiltersBar({ filters, onFiltersChange }: InspectionFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="매장, 점검자, 템플릿 검색..."
        value={filters.search}
        onChange={(e) => onFiltersChange({ search: e.target.value })}
        className="w-[240px]"
      />
      <Select
        value={filters.storeId}
        onValueChange={(value) => onFiltersChange({ storeId: value as InspectionFilters['storeId'] })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="매장 선택" />
        </SelectTrigger>
        <SelectContent>
          {storeOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.templateId}
        onValueChange={(value) => onFiltersChange({ templateId: value as InspectionFilters['templateId'] })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="템플릿 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 템플릿</SelectItem>
          {mockTemplates.map((tmpl) => (
            <SelectItem key={tmpl.id} value={tmpl.id}>
              {tmpl.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(value) => onFiltersChange({ status: value as InspectionFilters['status'] })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 상태</SelectItem>
          <SelectItem value="draft">임시저장</SelectItem>
          <SelectItem value="completed">완료</SelectItem>
          <SelectItem value="reviewed">검토완료</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
        className="w-[150px]"
        placeholder="시작일"
      />
      <Input
        type="date"
        value={filters.dateTo}
        onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
        className="w-[150px]"
        placeholder="종료일"
      />
    </div>
  );
}
