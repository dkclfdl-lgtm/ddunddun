'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CHART_COLORS } from '@/constants';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { CategorySummary } from '../types';

interface CategorySummaryChartProps {
  categories: CategorySummary[];
  onCategoryClick?: (categoryName: string) => void;
}

type SortMetric = 'totalSalesAmount' | 'totalQuantity' | 'totalOrders';

const SORT_OPTIONS: { key: SortMetric; label: string }[] = [
  { key: 'totalSalesAmount', label: '매출액' },
  { key: 'totalQuantity', label: '판매량' },
  { key: 'totalOrders', label: '주문수' },
];

export function CategorySummaryChart({ categories, onCategoryClick }: CategorySummaryChartProps) {
  const [sortBy, setSortBy] = useState<SortMetric>('totalSalesAmount');

  const sortedData = useMemo(() => {
    return [...categories]
      .filter((c) => c.totalSalesAmount > 0)
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [categories, sortBy]);

  const formatValue = (value: number) => {
    if (sortBy === 'totalSalesAmount') return formatCurrency(value);
    return formatNumber(value);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">카테고리별 분석</CardTitle>
          <div className="flex gap-1">
            {SORT_OPTIONS.map((opt) => (
              <Button
                key={opt.key}
                variant={sortBy === opt.key ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setSortBy(opt.key)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v: number) =>
                  sortBy === 'totalSalesAmount'
                    ? `${Math.floor(v / 10000).toLocaleString()}만`
                    : v.toLocaleString()
                }
              />
              <YAxis
                type="category"
                dataKey="categoryName"
                width={70}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [formatValue(Number(value)), SORT_OPTIONS.find((o) => o.key === sortBy)?.label ?? '']}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Bar
                dataKey={sortBy}
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(_data, _index) => {
                  const payload = _data as unknown as { categoryName?: string };
                  if (payload?.categoryName) onCategoryClick?.(payload.categoryName);
                }}
              >
                {sortedData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
