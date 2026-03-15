'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/format';
import { CHART_COLORS } from '@/constants';
import type { CategorySummary, ExcelProductData } from '../types';

interface SalesChannelAnalysisProps {
  categories: CategorySummary[];
  data: ExcelProductData[];
}

export function SalesChannelAnalysis({ categories, data }: SalesChannelAnalysisProps) {
  const channelData = useMemo(() => {
    return categories
      .filter((c) => c.totalSalesAmount > 0)
      .sort((a, b) => b.totalSalesAmount - a.totalSalesAmount)
      .slice(0, 15)
      .map((cat) => {
        const products = data.filter((p) => p.categoryName === cat.categoryName);
        const dineIn = products.reduce((s, p) => s + p.dineInSales, 0);
        const takeout = products.reduce((s, p) => s + p.takeoutSales, 0);
        const delivery = products.reduce((s, p) => s + p.deliverySales, 0);
        return {
          categoryName: cat.categoryName,
          매장: dineIn,
          포장: takeout,
          배달: delivery,
        };
      });
  }, [categories, data]);

  const overallMix = useMemo(() => {
    const totalDineIn = data.reduce((s, p) => s + p.dineInSales, 0);
    const totalTakeout = data.reduce((s, p) => s + p.takeoutSales, 0);
    const totalDelivery = data.reduce((s, p) => s + p.deliverySales, 0);
    const total = totalDineIn + totalTakeout + totalDelivery;
    return [
      { name: '매장', value: totalDineIn, ratio: total > 0 ? (totalDineIn / total) * 100 : 0 },
      { name: '포장', value: totalTakeout, ratio: total > 0 ? (totalTakeout / total) * 100 : 0 },
      { name: '배달', value: totalDelivery, ratio: total > 0 ? (totalDelivery / total) * 100 : 0 },
    ];
  }, [data]);

  const CHANNEL_COLORS = [CHART_COLORS[0], CHART_COLORS[2], CHART_COLORS[1]];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">카테고리별 판매 채널</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => `${Math.floor(v / 10000).toLocaleString()}만`}
                />
                <YAxis type="category" dataKey="categoryName" width={55} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
                />
                <Legend />
                <Bar dataKey="매장" stackId="channel" fill={CHANNEL_COLORS[0]} />
                <Bar dataKey="포장" stackId="channel" fill={CHANNEL_COLORS[1]} />
                <Bar dataKey="배달" stackId="channel" fill={CHANNEL_COLORS[2]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">전체 채널 비율</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={(props) => {
                    const p = props as unknown as { name?: string; ratio?: number };
                    return `${p.name ?? ''} ${formatPercent(p.ratio ?? 0)}`;
                  }}
                  labelLine={false}
                >
                  {overallMix.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {overallMix.map((channel, i) => (
              <div key={channel.name || i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHANNEL_COLORS[i] }}
                  />
                  <span>{channel.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{formatCurrency(channel.value)}</span>
                  <span className="text-muted-foreground ml-2">({formatPercent(channel.ratio)})</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
