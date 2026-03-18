'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
import { formatCompactCurrency, formatNumber } from '@/lib/format';
import type { SalesReportData, ChannelSummary } from '../types';

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

// Group channels into categories
const CHANNEL_GROUPS: Record<string, string[]> = {
  '홀 매출': ['홀', '홀 포장', '홀 배달'],
  '배달의민족': ['배달의민족', '배민 포장', '배민1'],
  '쿠팡이츠': ['쿠팡이츠', '쿠팡 포장'],
  '요기요': ['요기요', '요기요 포장', '요기배달'],
  '기타 배달': ['땡겨요', '땡겨요 포장', '배달특급'],
};

interface ChannelBreakdownProps {
  data: SalesReportData;
  channelData: ChannelSummary[];
}

export function ChannelBreakdown({ data, channelData }: ChannelBreakdownProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  // Per-store data for selected channel
  const storeChannelData = useMemo(() => {
    if (selectedChannel === 'all') {
      return data.stores
        .map((store) => ({
          name: store.storeName,
          value: store.totalSales,
          orders: store.totalOrders,
        }))
        .sort((a, b) => b.value - a.value);
    }

    return data.stores
      .map((store) => {
        const ch = store.channels.find(
          (c) => c.channelName === selectedChannel
        );
        return {
          name: store.storeName,
          value: ch?.sales ?? 0,
          orders: ch?.orders ?? 0,
        };
      })
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data, selectedChannel]);

  // Channel group summary
  const groupData = useMemo(() => {
    return Object.entries(CHANNEL_GROUPS).map(([groupName, channels]) => {
      const totalSales = channels.reduce((sum, ch) => {
        const found = channelData.find((c) => c.channelName === ch);
        return sum + (found?.totalSales ?? 0);
      }, 0);
      const totalOrders = channels.reduce((sum, ch) => {
        const found = channelData.find((c) => c.channelName === ch);
        return sum + (found?.totalOrders ?? 0);
      }, 0);
      return { name: groupName, totalSales, totalOrders };
    }).filter((g) => g.totalSales > 0);
  }, [channelData]);

  return (
    <div className="space-y-4">
      {/* Channel group overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">채널 그룹별 매출</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis tickFormatter={(v) => formatCompactCurrency(v)} fontSize={11} />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [
                    name === 'totalSales'
                      ? formatCompactCurrency(Number(value))
                      : `${formatNumber(Number(value))}건`,
                    name === 'totalSales' ? '매출' : '주문',
                  ]}
                />
                <Legend formatter={(v) => (v === 'totalSales' ? '매출' : '주문')} />
                <Bar dataKey="totalSales" fill="#03C75A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per-store chart for selected channel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">채널별 매장 매출</CardTitle>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 합계</SelectItem>
                {data.channels.map((ch) => (
                  <SelectItem key={ch} value={ch}>
                    {ch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={storeChannelData}
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
                  dataKey="name"
                  width={75}
                  fontSize={11}
                />
                <Tooltip
                  formatter={(value: unknown) => formatCompactCurrency(Number(value))}
                  labelFormatter={(label) => `매장: ${label}`}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {storeChannelData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Channel detail table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">채널별 상세 지표</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground">
                    채널
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    총 매출
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    주문건수
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    이용 매장
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    매장 평균
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    매출 비율
                  </th>
                </tr>
              </thead>
              <tbody>
                {channelData
                  .filter((ch) => ch.totalSales > 0)
                  .map((ch, i) => (
                    <tr
                      key={ch.channelName}
                      className="border-b last:border-b-0"
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                CHART_COLORS[i % CHART_COLORS.length],
                            }}
                          />
                          <span className="font-medium">{ch.channelName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {formatCompactCurrency(ch.totalSales)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {formatNumber(ch.totalOrders)}건
                      </td>
                      <td className="py-2 px-3 text-right">
                        {ch.storeCount}개
                      </td>
                      <td className="py-2 px-3 text-right">
                        {formatCompactCurrency(ch.avgSalesPerStore)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {ch.salesRatio.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
