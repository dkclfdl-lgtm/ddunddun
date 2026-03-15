'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInventoryList, useInventoryAlerts } from '@/features/inventory/hooks';
import {
  InventoryStats,
  InventoryFiltersBar,
  InventoryTable,
  InventoryChart,
  InventoryLogTable,
  LowStockAlerts,
} from '@/features/inventory/components';
import { getInventoryLogs } from '@/features/inventory/mock';

export default function InventoryPage() {
  const {
    items,
    filters,
    updateFilter,
    removeItem,
    refreshItems,
    statusCounts,
  } = useInventoryList();

  const { lowStockItems, outOfStockItems } = useInventoryAlerts();
  const [activeTab, setActiveTab] = useState('list');

  const allLogs = useMemo(() => getInventoryLogs(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="재고 관리"
        description="전체 매장의 재고 현황을 확인하고 관리하세요"
      />

      <InventoryStats statusCounts={statusCounts} />

      <LowStockAlerts
        lowStockItems={lowStockItems}
        outOfStockItems={outOfStockItems}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">재고 목록</TabsTrigger>
          <TabsTrigger value="chart">차트</TabsTrigger>
          <TabsTrigger value="logs">변동 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <InventoryFiltersBar
            filters={filters}
            onFilterChange={updateFilter}
          />
          <InventoryTable
            items={items}
            onDelete={removeItem}
            onStockAdjusted={refreshItems}
          />
        </TabsContent>

        <TabsContent value="chart">
          <InventoryChart items={items} />
        </TabsContent>

        <TabsContent value="logs">
          <InventoryLogTable logs={allLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
