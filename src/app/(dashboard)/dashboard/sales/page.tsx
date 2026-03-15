'use client';

import { useState, useMemo } from 'react';
import { subDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, DateRangePicker } from '@/components/common';
import type { DateRange } from '@/types';
import type { SalesFilters } from '@/features/sales/types';
import { SalesOverview } from '@/features/sales/components/sales-overview';
import { RevenueTrendChart } from '@/features/sales/components/revenue-trend-chart';
import { HourlyHeatmap } from '@/features/sales/components/hourly-heatmap';
import { MenuSalesTable } from '@/features/sales/components/menu-sales-table';
import { SalesComparison } from '@/features/sales/components/sales-comparison';
import { SalesTargetChart } from '@/features/sales/components/sales-target-chart';
import { ChannelBreakdown } from '@/features/sales/components/channel-breakdown';
import { PaymentBreakdown } from '@/features/sales/components/payment-breakdown';
import { ProductSalesTable } from '@/features/sales/components/product-sales-table';
import { SalesSimulation } from '@/features/sales/components/sales-simulation';
import { SalesRecommendations } from '@/features/sales/components/sales-recommendations';

const stores = [
  { id: 'all', name: '전체 매장' },
  { id: 'store-1', name: '강남점' },
  { id: 'store-2', name: '홍대점' },
  { id: 'store-3', name: '신촌점' },
  { id: 'store-4', name: '이태원점' },
  { id: 'store-5', name: '종로점' },
];

export default function SalesPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date('2026-03-15'), 29),
    to: new Date('2026-03-15'),
  });
  const [storeId, setStoreId] = useState<string>('all');

  const filters = useMemo<SalesFilters>(() => ({
    dateRange,
    storeId: storeId === 'all' ? undefined : storeId,
  }), [dateRange, storeId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="매출 분석"
        description="매장 매출 현황을 분석하고 인사이트를 확인하세요."
      >
        <Select value={storeId} onValueChange={setStoreId}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="매장 선택" />
          </SelectTrigger>
          <SelectContent>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="hourly">시간대분석</TabsTrigger>
          <TabsTrigger value="menu">메뉴별</TabsTrigger>
          <TabsTrigger value="comparison">기간비교</TabsTrigger>
          <TabsTrigger value="targets">목표달성</TabsTrigger>
          <TabsTrigger value="products">상품분석</TabsTrigger>
          <TabsTrigger value="simulation">시뮬레이션</TabsTrigger>
          <TabsTrigger value="recommendations">추천</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <SalesOverview filters={filters} />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueTrendChart filters={filters} />
            </div>
            <div className="space-y-4">
              <ChannelBreakdown filters={filters} />
              <PaymentBreakdown filters={filters} />
            </div>
          </div>
        </TabsContent>

        {/* Hourly analysis */}
        <TabsContent value="hourly">
          <HourlyHeatmap />
        </TabsContent>

        {/* Menu-based sales */}
        <TabsContent value="menu">
          <MenuSalesTable filters={filters} />
        </TabsContent>

        {/* Period comparison */}
        <TabsContent value="comparison">
          <SalesComparison filters={filters} />
        </TabsContent>

        {/* Target achievement */}
        <TabsContent value="targets">
          <SalesTargetChart />
        </TabsContent>

        {/* Product analysis */}
        <TabsContent value="products">
          <ProductSalesTable filters={filters} />
        </TabsContent>

        {/* Simulation */}
        <TabsContent value="simulation">
          <SalesSimulation />
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations">
          <SalesRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
