'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber, formatCompactCurrency } from '@/lib/format';
import type { StoreSummary } from '../types';

interface StoreRankingProps {
  stores: StoreSummary[];
  pageSize?: number;
}

export function StoreRanking({ stores, pageSize = 10 }: StoreRankingProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(stores.length / pageSize));

  const pagedStores = useMemo(() => {
    const start = page * pageSize;
    return stores.slice(start, start + pageSize);
  }, [stores, page, pageSize]);

  const maxSales = stores[0]?.totalSales ?? 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">매장 매출 순위</CardTitle>
          {totalPages > 1 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[60px] text-center">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pagedStores.map((store, idx) => {
            const globalIndex = page * pageSize + idx;
            const ratio = (store.totalSales / maxSales) * 100;
            return (
              <div key={store.storeName} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        globalIndex < 3
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {globalIndex + 1}
                    </span>
                    <span className="font-medium">{store.storeName}</span>
                    <span className="text-xs text-muted-foreground">
                      {store.storeTag}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">
                      {formatCompactCurrency(store.totalSales)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatNumber(store.totalOrders)}건
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/80 transition-all"
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          {page * pageSize + 1}~{Math.min((page + 1) * pageSize, stores.length)}위 표시 (전체 {stores.length}개 매장)
        </p>
      </CardContent>
    </Card>
  );
}
