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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatNumber, formatCompactCurrency } from '@/lib/format';
import type { SalesReportData } from '../types';

const CHART_COLORS = [
  '#03C75A',
  '#1A73E8',
  '#FF9500',
  '#9B59B6',
  '#E74C6F',
  '#00BCD4',
  '#FF6B6B',
  '#2ECC71',
];

interface StoreChannelDetailProps {
  data: SalesReportData;
}

export function StoreChannelDetail({ data }: StoreChannelDetailProps) {
  const [selectedStore, setSelectedStore] = useState<string>('');

  const storeNames = useMemo(
    () => data.stores.map((s) => s.storeName).sort(),
    [data]
  );

  const store = useMemo(
    () => data.stores.find((s) => s.storeName === selectedStore) ?? null,
    [data, selectedStore]
  );

  // Average of all stores per channel
  const allStoreAvg = useMemo(() => {
    const storeCount = data.stores.length;
    if (storeCount === 0) return new Map<string, { sales: number; orders: number; salesDays: number }>();
    const map = new Map<string, { sales: number; orders: number; salesDays: number }>();
    for (const ch of data.channels) {
      let totalSales = 0;
      let totalOrders = 0;
      let totalSalesDays = 0;
      for (const s of data.stores) {
        const c = s.channels.find((x) => x.channelName === ch);
        if (c) {
          totalSales += c.sales;
          totalOrders += c.orders;
          totalSalesDays += c.salesDays;
        }
      }
      map.set(ch, {
        sales: Math.round(totalSales / storeCount),
        orders: Math.round(totalOrders / storeCount),
        salesDays: Math.round(totalSalesDays / storeCount),
      });
    }
    return map;
  }, [data]);

  const channelData = useMemo(() => {
    if (!store) return [];
    return store.channels
      .map((ch) => ({
        name: ch.channelName,
        sales: ch.sales,
        orders: ch.orders,
        salesDays: ch.salesDays,
        ratio: store.totalSales > 0 ? (ch.sales / store.totalSales) * 100 : 0,
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [store]);

  const barChartData = useMemo(() => {
    return channelData.map((ch) => ({
      name: ch.name,
      매출: ch.sales,
    }));
  }, [channelData]);

  const pieChartData = useMemo(() => {
    return channelData
      .filter((ch) => ch.sales > 0)
      .map((ch, i) => ({
        name: ch.name,
        value: ch.sales,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      }));
  }, [channelData]);

  if (!selectedStore || !store) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">매장 상세 채널 분석</CardTitle>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="매장을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {storeNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">매장을 선택하면 채널별 상세 분석을 확인할 수 있습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Store selector */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">매장 상세 채널 분석</CardTitle>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="매장을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {storeNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">총매출</p>
            <p className="text-2xl font-bold mt-1">
              {formatCompactCurrency(store.totalSales)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">총주문</p>
            <p className="text-2xl font-bold mt-1">
              {formatNumber(store.totalOrders)}건
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">판매일수</p>
            <p className="text-2xl font-bold mt-1">
              {formatNumber(store.totalSalesDays)}일
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Horizontal bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">채널별 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCompactCurrency(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={70}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: unknown) => [formatCurrency(Number(value)), '매출']}
                  />
                  <Bar dataKey="매출" fill="#03C75A" radius={[0, 4, 4, 0]}>
                    {barChartData.map((_, index) => (
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

        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">채널 매출 비율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(1)}%`
                    }
                    labelLine={true}
                    fontSize={11}
                  >
                    {pieChartData.map((entry, i) => (
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
          </CardContent>
        </Card>
      </div>

      {/* Channel detail table with comparison to average */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">채널별 상세 (전체 매장 평균 비교)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '700px' }}>
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    채널
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                    매출
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                    평균 매출
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                    차이
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                    주문건수
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                    판매일수
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                    비율
                  </th>
                </tr>
              </thead>
              <tbody>
                {channelData.map((ch, idx) => {
                  const avg = allStoreAvg.get(ch.name);
                  const diff = avg ? ch.sales - avg.sales : 0;
                  return (
                    <tr key={ch.name} className="border-b last:border-b-0">
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                CHART_COLORS[idx % CHART_COLORS.length],
                            }}
                          />
                          <span className="font-medium">{ch.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-medium whitespace-nowrap">
                        {formatCompactCurrency(ch.sales)}
                      </td>
                      <td className="py-2 px-3 text-right text-muted-foreground whitespace-nowrap">
                        {avg ? formatCompactCurrency(avg.sales) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <span
                          className={
                            diff > 0
                              ? 'text-green-600'
                              : diff < 0
                                ? 'text-red-600'
                                : 'text-muted-foreground'
                          }
                        >
                          {diff > 0 ? '+' : ''}
                          {formatCompactCurrency(diff)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        {formatNumber(ch.orders)}건
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        {ch.salesDays}일
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        {ch.ratio.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-semibold border-t">
                  <td className="py-2 px-3 whitespace-nowrap">합계</td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    {formatCompactCurrency(store.totalSales)}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap text-muted-foreground">
                    -
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap text-muted-foreground">
                    -
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    {formatNumber(store.totalOrders)}건
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    {store.totalSalesDays}일
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
