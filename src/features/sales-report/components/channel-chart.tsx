'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCompactCurrency, formatNumber } from '@/lib/format';
import type { ChannelSummary } from '../types';

const CHART_COLORS = [
  '#03C75A',
  '#1A73E8',
  '#FF9500',
  '#9B59B6',
  '#E74C6F',
  '#00BCD4',
  '#FF6B6B',
  '#2ECC71',
  '#F39C12',
  '#3498DB',
  '#E91E63',
  '#00ACC1',
  '#FF5722',
  '#8BC34A',
];

interface ChannelChartProps {
  channelData: ChannelSummary[];
}

function SalesTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChannelSummary }> }) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold">{data.channelName}</p>
      <p className="text-muted-foreground">
        매출: {formatCompactCurrency(data.totalSales)}
      </p>
      <p className="text-muted-foreground">
        주문: {formatNumber(data.totalOrders)}건
      </p>
      <p className="text-muted-foreground">
        매장 수: {data.storeCount}개
      </p>
      <p className="text-muted-foreground">
        비율: {data.salesRatio.toFixed(1)}%
      </p>
    </div>
  );
}

export function ChannelChart({ channelData }: ChannelChartProps) {
  const filtered = channelData.filter((ch) => ch.totalSales > 0);

  const pieData = filtered.map((ch, i) => ({
    ...ch,
    name: ch.channelName,
    value: ch.totalSales,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">채널별 매출 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bar">막대 차트</TabsTrigger>
            <TabsTrigger value="pie">원형 차트</TabsTrigger>
          </TabsList>

          <TabsContent value="bar">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filtered}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCompactCurrency(v)}
                    fontSize={11}
                  />
                  <YAxis
                    type="category"
                    dataKey="channelName"
                    width={75}
                    fontSize={11}
                  />
                  <Tooltip content={<SalesTooltip />} />
                  <Bar dataKey="totalSales" radius={[0, 4, 4, 0]}>
                    {filtered.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                    <LabelList
                      dataKey="totalSales"
                      position="right"
                      formatter={(v: unknown) => formatCompactCurrency(Number(v))}
                      style={{ fontSize: 10, fill: '#475569' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="pie">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    innerRadius={60}
                    dataKey="value"
                    label={({ name, percent }: any) =>
                      `${name} (${(percent * 100).toFixed(1)}%)`
                    }
                    labelLine={true}
                    fontSize={11}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => formatCompactCurrency(Number(value))}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
