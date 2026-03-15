'use client';

import { AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import type { InventoryItem } from '../types';

interface LowStockAlertsProps {
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
}

export function LowStockAlerts({ lowStockItems, outOfStockItems }: LowStockAlertsProps) {
  const hasAlerts = lowStockItems.length > 0 || outOfStockItems.length > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle size={18} className="text-yellow-500" />
            재고 알림
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {lowStockItems.length + outOfStockItems.length}건
            </span>
          </CardTitle>
          <Link href={ROUTES.inventory}>
            <Button variant="ghost" size="sm" className="text-xs">
              전체 보기
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {outOfStockItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3"
          >
            <div className="flex items-center gap-3">
              <XCircle size={16} className="text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">{item.itemName}</p>
                <p className="text-xs text-red-600">
                  {item.storeName} - 재고 소진
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-700">0 {item.unit}</p>
              <p className="text-xs text-red-500">
                최소: {item.minStock} {item.unit}
              </p>
            </div>
          </div>
        ))}

        {lowStockItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-yellow-800">{item.itemName}</p>
                <p className="text-xs text-yellow-600">
                  {item.storeName} - 재고 부족
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-yellow-700">
                {item.currentStock} {item.unit}
              </p>
              <p className="text-xs text-yellow-500">
                최소: {item.minStock} {item.unit}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
