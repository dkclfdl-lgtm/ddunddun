'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSalesOverview } from '../hooks';
import type { SalesFilters } from '../types';

interface SalesOverviewProps {
  filters?: SalesFilters;
}

interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

function KpiCard({ title, value, change, icon }: KpiCardProps) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-[#03C75A]/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-[#03C75A]" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              isPositive ? 'text-[#03C75A]' : 'text-red-500'
            )}
          >
            {isPositive ? '+' : ''}
            {formatPercent(change)}
          </span>
          <span className="text-xs text-muted-foreground">전월 대비</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function SalesOverview({ filters }: SalesOverviewProps) {
  const { summary } = useSalesOverview(filters);

  const revenueChange =
    summary.previousRevenue > 0
      ? ((summary.totalRevenue - summary.previousRevenue) / summary.previousRevenue) * 100
      : 0;

  const ordersChange =
    summary.previousOrders > 0
      ? ((summary.totalOrders - summary.previousOrders) / summary.previousOrders) * 100
      : 0;

  const avgChange =
    summary.previousAvgOrderValue > 0
      ? ((summary.avgOrderValue - summary.previousAvgOrderValue) / summary.previousAvgOrderValue) * 100
      : 0;

  const cardRateChange = summary.cardPaymentRate - summary.previousCardPaymentRate;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="총매출"
        value={formatCurrency(summary.totalRevenue)}
        change={revenueChange}
        icon={<DollarSign className="h-4 w-4 text-[#03C75A]" />}
      />
      <KpiCard
        title="총주문수"
        value={`${formatNumber(summary.totalOrders)}건`}
        change={ordersChange}
        icon={<ShoppingCart className="h-4 w-4 text-[#03C75A]" />}
      />
      <KpiCard
        title="평균객단가"
        value={formatCurrency(summary.avgOrderValue)}
        change={avgChange}
        icon={<Users className="h-4 w-4 text-[#03C75A]" />}
      />
      <KpiCard
        title="카드결제율"
        value={formatPercent(summary.cardPaymentRate)}
        change={cardRateChange}
        icon={<CreditCard className="h-4 w-4 text-[#03C75A]" />}
      />
    </div>
  );
}
