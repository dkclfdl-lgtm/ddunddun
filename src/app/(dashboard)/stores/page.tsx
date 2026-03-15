'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useStoreList } from '@/features/stores/hooks';
import { StoreTable } from '@/features/stores/components/store-table';
import { StoreGrid } from '@/features/stores/components/store-grid';
import { StoreFiltersBar } from '@/features/stores/components/store-filters';

export default function StoresPage() {
  const {
    stores,
    filters,
    viewMode,
    setViewMode,
    updateSearch,
    updateStatus,
    deleteStore,
    statusCounts,
  } = useStoreList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">매장 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            전체 매장을 관리하고 운영 현황을 확인하세요
          </p>
        </div>
        <Link href={ROUTES.storeNew}>
          <Button>
            <Plus size={16} className="mr-1.5" />
            매장 등록
          </Button>
        </Link>
      </div>

      <StoreFiltersBar
        filters={filters}
        viewMode={viewMode}
        statusCounts={statusCounts}
        onSearchChange={updateSearch}
        onStatusChange={updateStatus}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'table' ? (
        <StoreTable stores={stores} onDelete={deleteStore} />
      ) : (
        <StoreGrid stores={stores} />
      )}
    </div>
  );
}
