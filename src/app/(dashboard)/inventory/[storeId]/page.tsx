'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/constants';
import { useInventoryList } from '@/features/inventory/hooks';
import {
  InventoryStats,
  InventoryFiltersBar,
  InventoryTable,
  InventoryChart,
  InventoryLogTable,
} from '@/features/inventory/components';
import { getInventoryLogs, getStoreOptions } from '@/features/inventory/mock';

export default function StoreInventoryPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);
  const stores = useMemo(() => getStoreOptions(), []);
  const storeName = useMemo(() => stores.find((s) => s.id === storeId)?.name ?? storeId, [stores, storeId]);

  const {
    items,
    filters,
    updateFilter,
    removeItem,
    refreshItems,
    statusCounts,
  } = useInventoryList({ storeId });

  const [activeTab, setActiveTab] = useState('list');
  const storeLogs = useMemo(() => getInventoryLogs().filter((log) => {
    const item = items.find((i) => i.id === log.inventoryId);
    return !!item;
  }), [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.inventory}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`${storeName} 재고 관리`}
          description={`${storeName}의 재고 현황을 확인하고 관리하세요`}
        />
      </div>

      <InventoryStats statusCounts={statusCounts} />

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
          <InventoryLogTable logs={storeLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
