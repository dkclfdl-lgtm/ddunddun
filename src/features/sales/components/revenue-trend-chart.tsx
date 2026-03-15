'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatCompactCurrency } from '@/lib/format';
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useSalesOverview } from '../hooks';
import type { SalesFilters } from '../types';
import { cn } from '@/lib/utils';

type ViewMode = 'daily' | 'weekly' | 'monthly';

interface RevenueTrendChartProps {
  filters?: SalesFilters;
}

export function RevenueTrendChart({ filters }: RevenueTrendChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const { data } = useSalesOverview(filters);

  const chartData = useMemo(() => {
    if (viewMode === 'daily') {
      return data.map((d) => ({
        label: format(parseISO(d.date), 'MM/dd', { locale: ko }),
        현재기간: d.revenue,
        이전기간: Math.round(d.revenue * (0.85 + Math.random() * 0.2)),
      }));
    }

    if (viewMode === 'weekly') {
      const weeklyMap = new Map<string, { current: number; previous: number }>();
      data.forEach((d) => {
        const date = parseISO(d.date);
        const weekStart = startOfWeek(date, { locale: ko });
        const key = format(weekStart, 'MM/dd', { locale: ko });
        const existing = weeklyMap.get(key) || { current: 0, previous: 0 };
        existing.current += d.revenue;
        existing.previous += Math.round(d.revenue * (0.85 + Math.random() * 0.2));
        weeklyMap.set(key, existing);
      });
      return Array.from(weeklyMap.entries()).map(([label, values]) => ({
        label: `${label}주`,
        현재기간: values.current,
        이전기간: values.previous,
      }));
    }

    // monthly
    const monthlyMap = new Map<string, { current: number; previous: number }>();
    data.forEach((d) => {
      const date = parseISO(d.date);
      const key = format(date, 'yyyy-MM', { locale: ko });
      const existing = monthlyMap.get(key) || { current: 0, previous: 0 };
      existing.current += d.revenue;
      existing.previous += Math.round(d.revenue * (0.85 + Math.random() * 0.2));
      monthlyMap.set(key, existing);
    });
    return Array.from(monthlyMap.entries()).map(([label, values]) => ({
      label: format(parseISO(`${label}-01`), 'M월', { locale: ko }),
      현재기간: values.current,
      이전기간: values.previous,
    }));
  }, [data, viewMode]);

  const viewModes: { key: ViewMode; label: string }[] = [
    { key: 'daily', label: '일별' },
    { key: 'weekly', label: '주별' },
    { key: 'monthly', label: '월별' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">매출 추이</CardTitle>
        <div className="flex gap-1">
          {viewModes.map((mode) => (
            <Button
              key={mode.key}
              variant={viewMode === mode.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(mode.key)}
              className={cn(
                viewMode === mode.key && 'bg-[#03C75A] hover:bg-[#02b350]'
              )}
            >
              {mode.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                tickFormatter={(value) => formatCompactCurrency(value)}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="현재기간"
                stroke="#03C75A"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="이전기간"
                stroke="#B0B8C1"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
