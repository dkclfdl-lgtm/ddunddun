'use client';

import {
  DollarSign,
  ShoppingCart,
  Store,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatCompactCurrency } from '@/lib/format';
import type { SalesReportData } from '../types';

interface SalesOverviewProps {
  data: SalesReportData;
}

export function SalesOverview({ data }: SalesOverviewProps) {
  const totalSales = data.stores.reduce((s, st) => s + st.totalSales, 0);
  const totalOrders = data.stores.reduce((s, st) => s + st.totalOrders, 0);
  const storeCount = data.stores.length;
  const avgSales = storeCount > 0 ? Math.round(totalSales / storeCount) : 0;

  const cards = [
    {
      label: '총 매출',
      value: formatCompactCurrency(totalSales),
      subValue: formatCurrency(totalSales),
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: '총 주문건수',
      value: `${formatNumber(totalOrders)}건`,
      subValue: `객단가 ${formatCurrency(totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0)}`,
      icon: ShoppingCart,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: '매장 수',
      value: `${storeCount}개`,
      subValue: `${data.channels.length}개 채널`,
      icon: Store,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: '매장 평균 매출',
      value: formatCompactCurrency(avgSales),
      subValue: formatCurrency(avgSales),
      icon: TrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.subValue}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
