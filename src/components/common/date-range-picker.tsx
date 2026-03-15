'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { DateRange } from '@/types';

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  const formatDate = (date: Date) =>
    format(date, 'yyyy년 MM월 dd일', { locale: ko });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[300px] justify-start text-left font-normal',
            !dateRange && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {formatDate(dateRange.from)} ~ {formatDate(dateRange.to)}
              </>
            ) : (
              formatDate(dateRange.from)
            )
          ) : (
            <span>기간을 선택하세요</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={
            dateRange
              ? { from: dateRange.from, to: dateRange.to }
              : undefined
          }
          onSelect={(range) => {
            if (!range) {
              onDateRangeChange(undefined);
              return;
            }
            if (range.from && range.to) {
              onDateRangeChange({ from: range.from, to: range.to });
            } else if (range.from) {
              onDateRangeChange({ from: range.from, to: range.from });
            }
          }}
          numberOfMonths={2}
          locale={ko}
        />
      </PopoverContent>
    </Popover>
  );
}
