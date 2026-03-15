'use client';

import { useState, useMemo } from 'react';
import { DollarSign, ShoppingCart, Users, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/features/dashboard/components/kpi-card';
import { RevenueChart } from '@/features/dashboard/components/revenue-chart';
import { CategoryChart } from '@/features/dashboard/components/category-chart';
import { StoreRankingChart } from '@/features/dashboard/components/store-ranking-chart';
import { RecentAlerts } from '@/features/dashboard/components/recent-alerts';
import { useAnalyticsStore } from '@/features/analytics/store';
import { formatCurrency, formatNumber } from '@/lib/format';

const dateRangeOptions = [
  { label: '오늘', value: 'today' },
  { label: '7일', value: '7d' },
  { label: '30일', value: '30d' },
  { label: '90일', value: '90d' },
] as const;

const defaultKpiData = [
  {
    title: '오늘 매출',
    value: '12,450,000원',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
    description: '전일 대비',
  },
  {
    title: '주문 수',
    value: '342건',
    change: '+8.2%',
    trend: 'up' as const,
    icon: ShoppingCart,
    description: '전일 대비',
  },
  {
    title: '객단가',
    value: '36,400원',
    change: '-2.1%',
    trend: 'down' as const,
    icon: Users,
    description: '전일 대비',
  },
  {
    title: '운영 매장',
    value: '24개',
    change: '+1',
    trend: 'up' as const,
    icon: Store,
    description: '이번 달 신규',
  },
];

const revenueData = [
  { date: '03.01', revenue: 9800000, orders: 280 },
  { date: '03.02', revenue: 10200000, orders: 295 },
  { date: '03.03', revenue: 8500000, orders: 240 },
  { date: '03.04', revenue: 11000000, orders: 310 },
  { date: '03.05', revenue: 10800000, orders: 305 },
  { date: '03.06', revenue: 12100000, orders: 330 },
  { date: '03.07', revenue: 13500000, orders: 360 },
  { date: '03.08', revenue: 11200000, orders: 315 },
  { date: '03.09', revenue: 10500000, orders: 290 },
  { date: '03.10', revenue: 9900000, orders: 275 },
  { date: '03.11', revenue: 11800000, orders: 325 },
  { date: '03.12', revenue: 12300000, orders: 338 },
  { date: '03.13', revenue: 11600000, orders: 320 },
  { date: '03.14', revenue: 12800000, orders: 348 },
  { date: '03.15', revenue: 12450000, orders: 342 },
];

const storeRankingData = [
  { name: '강남점', revenue: 45200000 },
  { name: '홍대점', revenue: 38500000 },
  { name: '명동점', revenue: 35800000 },
  { name: '잠실점', revenue: 32100000 },
  { name: '신촌점', revenue: 28900000 },
];

const defaultCategoryData = [
  { name: '음료', value: 35 },
  { name: '식사', value: 30 },
  { name: '디저트', value: 20 },
  { name: '사이드', value: 15 },
];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<string>('today');
  const uploadedData = useAnalyticsStore((s) => s.uploadedData);
  const hasAnalyticsData = uploadedData.length > 0;

  // Compute KPI data from uploaded analytics data if available
  const kpiData = useMemo(() => {
    if (!hasAnalyticsData) return defaultKpiData;

    const totalRevenue = uploadedData.reduce(
      (s, p) => s + p.actualSalesAmount,
      0
    );
    const totalOrders = uploadedData.reduce(
      (s, p) => s + p.orderCount,
      0
    );
    const avgOrderValue =
      totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0;
    const salesDays = uploadedData[0]?.salesDays || 73;
    const dailyAvgRevenue = Math.floor(totalRevenue / salesDays);

    return [
      {
        title: '일 평균 매출',
        value: formatCurrency(dailyAvgRevenue),
        change: `${salesDays}일 평균`,
        trend: 'up' as const,
        icon: DollarSign,
        description: '업로드 데이터 기준',
      },
      {
        title: '총 주문수',
        value: `${formatNumber(totalOrders)}건`,
        change: `${formatNumber(uploadedData.length)}개 상품`,
        trend: 'up' as const,
        icon: ShoppingCart,
        description: '전체 기간',
      },
      {
        title: '객단가',
        value: formatCurrency(avgOrderValue),
        change: formatCurrency(totalRevenue),
        trend: 'up' as const,
        icon: Users,
        description: '총 매출',
      },
      {
        title: '운영 매장',
        value: '24개',
        change: '+1',
        trend: 'up' as const,
        icon: Store,
        description: '이번 달 신규',
      },
    ];
  }, [hasAnalyticsData, uploadedData]);

  // Build category data from analytics data if available
  const categoryData = useMemo(() => {
    if (!hasAnalyticsData) return defaultCategoryData;

    const catMap = new Map<string, number>();
    for (const p of uploadedData) {
      if (!p.categoryName) continue;
      catMap.set(
        p.categoryName,
        (catMap.get(p.categoryName) ?? 0) + (p.actualSalesAmount || 0)
      );
    }
    const total = Array.from(catMap.values()).reduce(
      (s, v) => s + v,
      0
    );
    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({
        name,
        value: total > 0 ? Math.round((value / total) * 100) : 0,
      }));
  }, [hasAnalyticsData, uploadedData]);

  return (
    <div className="space-y-6">
      {/* Page Header with Date Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasAnalyticsData
              ? '업로드된 판매 데이터 기반 현황입니다'
              : '오늘의 운영 현황을 한눈에 확인하세요'}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {dateRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={dateRange === option.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDateRange(option.value)}
              className="h-8 px-3"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RevenueChart data={revenueData} />
        <CategoryChart data={categoryData} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StoreRankingChart data={storeRankingData} />
        <RecentAlerts />
      </div>
    </div>
  );
}
