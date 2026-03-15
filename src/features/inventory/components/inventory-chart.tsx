'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COLORS } from '@/constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { InventoryItem } from '../types';

interface InventoryChartProps {
  items: InventoryItem[];
}

export function InventoryChart({ items }: InventoryChartProps) {
  const categoryData = useMemo(() => {
    const map = new Map<string, { category: string; count: number; totalValue: number }>();
    items.forEach((item) => {
      const existing = map.get(item.category) ?? {
        category: item.category,
        count: 0,
        totalValue: 0,
      };
      existing.count += 1;
      existing.totalValue += item.totalValue;
      map.set(item.category, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.totalValue - a.totalValue);
  }, [items]);

  const statusData = useMemo(() => {
    const counts = { normal: 0, low: 0, out: 0, excess: 0 };
    items.forEach((item) => {
      counts[item.status]++;
    });
    return [
      { name: '정상', value: counts.normal, color: '#22c55e' },
      { name: '부족', value: counts.low, color: '#eab308' },
      { name: '소진', value: counts.out, color: '#ef4444' },
      { name: '과잉', value: counts.excess, color: '#3b82f6' },
    ].filter((d) => d.value > 0);
  }, [items]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            카테고리별 재고 가치
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 10000).toFixed(0)}만`;
                    if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
                    return value.toLocaleString();
                  }}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString()}원`,
                    '재고 가치',
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Bar
                  dataKey="totalValue"
                  fill={CHART_COLORS[0]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            재고 상태 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}건`, name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))', fontSize: '13px' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
