'use client';

import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Schedule } from '../types';
import { useSchedule } from '../hooks';
import { ScheduleForm } from './schedule-form';

const ROLE_COLORS: Record<string, string> = {
  manager: 'bg-purple-100 border-purple-300 text-purple-800',
  cook: 'bg-orange-100 border-orange-300 text-orange-800',
  server: 'bg-blue-100 border-blue-300 text-blue-800',
  part_time: 'bg-cyan-100 border-cyan-300 text-cyan-800',
  delivery: 'bg-green-100 border-green-300 text-green-800',
};

const storeOptions = [
  { value: 'all', label: '전체 매장' },
  { value: 'store-1', label: '강남점' },
  { value: 'store-2', label: '홍대점' },
  { value: 'store-3', label: '명동점' },
  { value: 'store-4', label: '잠실점' },
  { value: 'store-5', label: '신촌점' },
];

export function ScheduleCalendar() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [storeId, setStoreId] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const { schedules, addSchedule, deleteSchedule } = useSchedule(storeId);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const staffRows = useMemo(() => {
    const staffMap = new Map<string, { name: string; role: string; schedules: Map<string, Schedule> }>();

    for (const schedule of schedules) {
      if (!staffMap.has(schedule.staffId)) {
        const staffEntry = schedules.find((s) => s.staffId === schedule.staffId);
        staffMap.set(schedule.staffId, {
          name: staffEntry?.staffName ?? '',
          role: 'server',
          schedules: new Map(),
        });
      }
      staffMap.get(schedule.staffId)!.schedules.set(schedule.date, schedule);
    }

    return Array.from(staffMap.entries()).map(([staffId, data]) => ({
      staffId,
      ...data,
    }));
  }, [schedules]);

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const handleCellClick = (date: string, schedule?: Schedule) => {
    setSelectedDate(date);
    setSelectedSchedule(schedule ?? null);
    setFormOpen(true);
  };

  const handleScheduleSubmit = (data: {
    staffId: string;
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    memo?: string;
  }) => {
    if (selectedSchedule) {
      deleteSchedule(selectedSchedule.id);
    }
    addSchedule(data);
    setFormOpen(false);
    setSelectedSchedule(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>주간 스케줄</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger className="w-36">
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

              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[160px] text-center text-sm font-medium">
                  {format(currentWeekStart, 'yyyy년 MM월 dd일', { locale: ko })} ~{' '}
                  {format(addDays(currentWeekStart, 6), 'MM월 dd일', { locale: ko })}
                </span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button size="sm" onClick={() => { setSelectedDate(format(new Date(), 'yyyy-MM-dd')); setSelectedSchedule(null); setFormOpen(true); }}>
                <Plus className="mr-1 h-4 w-4" />
                스케줄 추가
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 w-28 border bg-muted/50 p-2 text-left text-sm font-medium">
                    직원
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.toISOString()}
                      className={cn(
                        'min-w-[120px] border p-2 text-center text-sm font-medium',
                        day.getDay() === 0 && 'text-red-500',
                        day.getDay() === 6 && 'text-blue-500',
                        format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 'bg-green-50'
                      )}
                    >
                      <div>{format(day, 'EEE', { locale: ko })}</div>
                      <div className="text-xs text-muted-foreground">{format(day, 'MM/dd')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="border p-8 text-center text-muted-foreground">
                      스케줄 데이터가 없습니다
                    </td>
                  </tr>
                ) : (
                  staffRows.map((row) => (
                    <tr key={row.staffId}>
                      <td className="sticky left-0 z-10 border bg-white p-2 text-sm font-medium">
                        {row.name}
                      </td>
                      {weekDays.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const schedule = row.schedules.get(dateStr);

                        return (
                          <td
                            key={dateStr}
                            className={cn(
                              'border p-1 text-center',
                              format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 'bg-green-50/50'
                            )}
                          >
                            {schedule ? (
                              <button
                                type="button"
                                onClick={() => handleCellClick(dateStr, schedule)}
                                className={cn(
                                  'w-full rounded border px-1 py-1.5 text-xs transition-colors hover:opacity-80',
                                  ROLE_COLORS[row.role] ?? 'bg-gray-100 border-gray-300 text-gray-800'
                                )}
                              >
                                <div className="font-medium">
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                                <div className="text-[10px] opacity-70">
                                  {schedule.workHours}시간
                                </div>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCellClick(dateStr)}
                                className="flex h-10 w-full items-center justify-center rounded text-muted-foreground/30 transition-colors hover:bg-muted/50"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(ROLE_COLORS).map(([role, color]) => {
              const labels: Record<string, string> = {
                manager: '매니저',
                cook: '주방',
                server: '서빙',
                part_time: '파트타임',
                delivery: '배달',
              };
              return (
                <div key={role} className="flex items-center gap-1.5">
                  <div className={cn('h-3 w-3 rounded border', color)} />
                  <span className="text-xs text-muted-foreground">{labels[role]}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ScheduleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        date={selectedDate}
        schedule={selectedSchedule}
        storeId={storeId}
        onSubmit={handleScheduleSubmit}
      />
    </>
  );
}
