'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatCompactCurrency, formatPercent } from '@/lib/format';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSalesComparison } from '../hooks';
import type { SalesFilters } from '../types';

interface SalesComparisonProps {
  filters?: SalesFilters;
}

export function SalesComparison({ filters }: SalesComparisonProps) {
  const { data } = useSalesComparison(filters);

  const chartData = data.map((d) => ({
    period: d.period,
    현재기간: d.current,
    이전기간: d.previous,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">기간별 매출 비교</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => formatCompactCurrency(v)}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar
                  dataKey="현재기간"
                  fill="#03C75A"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="이전기간"
                  fill="#B0B8C1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detail cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {data.map((item) => (
          <Card key={item.period}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {item.period}
                </span>
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    item.changePercent >= 0 ? 'text-[#03C75A]' : 'text-red-500'
                  )}
                >
                  {item.changePercent >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {item.changePercent >= 0 ? '+' : ''}
                  {formatPercent(item.changePercent)}
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">현재</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(item.current)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">이전</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(item.previous)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-xs text-muted-foreground">차이</span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      item.change >= 0 ? 'text-[#03C75A]' : 'text-red-500'
                    )}
                  >
                    {item.change >= 0 ? '+' : ''}
                    {formatCurrency(item.change)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
