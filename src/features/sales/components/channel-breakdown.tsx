'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/format';
import { Store, Package, Truck } from 'lucide-react';
import { useSalesOverview } from '../hooks';
import type { SalesFilters } from '../types';

interface ChannelBreakdownProps {
  filters?: SalesFilters;
}

const CHANNEL_COLORS = ['#03C75A', '#36D399', '#7EDDB9'];

export function ChannelBreakdown({ filters }: ChannelBreakdownProps) {
  const { data } = useSalesOverview(filters);

  const channelData = useMemo(() => {
    const totalDineIn = data.reduce((sum, d) => sum + d.dineIn, 0);
    const totalTakeout = data.reduce((sum, d) => sum + d.takeout, 0);
    const totalDelivery = data.reduce((sum, d) => sum + d.delivery, 0);
    const total = totalDineIn + totalTakeout + totalDelivery;

    return [
      {
        name: '매장',
        value: totalDineIn,
        percentage: total > 0 ? (totalDineIn / total) * 100 : 0,
        icon: Store,
      },
      {
        name: '포장',
        value: totalTakeout,
        percentage: total > 0 ? (totalTakeout / total) * 100 : 0,
        icon: Package,
      },
      {
        name: '배달',
        value: totalDelivery,
        percentage: total > 0 ? (totalDelivery / total) * 100 : 0,
        icon: Truck,
      },
    ];
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">채널별 매출</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="h-[220px] w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {channelData.map((_, index) => (
                    <Cell key={index} fill={CHANNEL_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-4 w-full">
            {channelData.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <div key={channel.name || index} className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${CHANNEL_COLORS[index]}20` }}
                  >
                    <Icon
                      className="h-4 w-4"
                      style={{ color: CHANNEL_COLORS[index] }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{channel.name}</span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(channel.value)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${channel.percentage}%`,
                            backgroundColor: CHANNEL_COLORS[index],
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatPercent(channel.percentage)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
