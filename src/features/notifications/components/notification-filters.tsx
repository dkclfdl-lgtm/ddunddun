'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NotificationFilters as NotificationFiltersType } from '../types';

const NOTIFICATION_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'sales_alert', label: '매출 알림' },
  { value: 'inventory_alert', label: '재고 알림' },
  { value: 'inspection_due', label: '점검 알림' },
  { value: 'review_new', label: '리뷰 알림' },
  { value: 'staff_absence', label: '직원 알림' },
  { value: 'system', label: '시스템' },
] as const;

interface NotificationFiltersProps {
  filters: NotificationFiltersType;
  onTypeChange: (type: NotificationFiltersType['type']) => void;
  onReadChange: (isRead: NotificationFiltersType['isRead']) => void;
  onMarkAllRead: () => void;
}

export function NotificationFilters({
  filters,
  onTypeChange,
  onReadChange,
  onMarkAllRead,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Select
          value={filters.type}
          onValueChange={(value) => onTypeChange(value as NotificationFiltersType['type'])}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="유형 선택" />
          </SelectTrigger>
          <SelectContent>
            {NOTIFICATION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center rounded-md border border-border">
          {(['all', 'unread', 'read'] as const).map((value) => (
            <Button
              key={value}
              variant={filters.isRead === value ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none first:rounded-l-md last:rounded-r-md"
              onClick={() => onReadChange(value)}
            >
              {value === 'all' ? '전체' : value === 'unread' ? '읽지 않음' : '읽음'}
            </Button>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onMarkAllRead}>
        모두 읽음 처리
      </Button>
    </div>
  );
}
