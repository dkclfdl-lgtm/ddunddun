'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Package2 } from 'lucide-react';
import { DataTable } from '@/components/common';
import { StatusBadge } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/format';
import type { InventoryItem } from '../types';
import { StockAdjustDialog } from './stock-adjust-dialog';

const INVENTORY_STATUS_MAP = {
  normal: { label: '정상', color: 'bg-green-100 text-green-700' },
  low: { label: '부족', color: 'bg-yellow-100 text-yellow-700' },
  out: { label: '소진', color: 'bg-red-100 text-red-700' },
  excess: { label: '과잉', color: 'bg-blue-100 text-blue-700' },
} as const;

interface InventoryTableProps {
  items: InventoryItem[];
  onDelete: (id: string) => void;
  onStockAdjusted?: () => void;
}

export function InventoryTable({ items, onDelete, onStockAdjusted }: InventoryTableProps) {
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: 'itemName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          품목
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package2 size={16} className="text-muted-foreground" />
          <span className="font-medium">{row.getValue('itemName')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: '카테고리',
      cell: ({ row }) => (
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
          {row.getValue('category')}
        </span>
      ),
    },
    {
      accessorKey: 'storeName',
      header: '매장',
    },
    {
      accessorKey: 'currentStock',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          현재재고
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const stockRatio = item.maxStock > 0 ? (item.currentStock / item.maxStock) * 100 : 0;
        return (
          <div className="space-y-1">
            <span className="font-medium">
              {item.currentStock} {item.unit}
            </span>
            <div className="h-1.5 w-20 rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${
                  item.status === 'out'
                    ? 'bg-red-500'
                    : item.status === 'low'
                      ? 'bg-yellow-500'
                      : item.status === 'excess'
                        ? 'bg-blue-500'
                        : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, stockRatio)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'minStock',
      header: '최소재고',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span className="text-muted-foreground">
            {item.minStock} {item.unit}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => (
        <StatusBadge
          status={row.getValue('status')}
          statusMap={INVENTORY_STATUS_MAP}
        />
      ),
    },
    {
      accessorKey: 'unitCost',
      header: '단가',
      cell: ({ row }) => formatCurrency(row.getValue('unitCost')),
    },
    {
      accessorKey: 'supplier',
      header: '공급업체',
    },
    {
      accessorKey: 'lastOrderedAt',
      header: '최종발주일',
      cell: ({ row }) => {
        const date = row.getValue('lastOrderedAt') as string | null;
        return date ? formatDate(date) : '-';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setAdjustItem(item)}>
                재고 조정
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(item.id)}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={items} searchKey="itemName" searchPlaceholder="품목명으로 검색..." />
      {adjustItem && (
        <StockAdjustDialog
          item={adjustItem}
          open={!!adjustItem}
          onOpenChange={(open) => {
            if (!open) setAdjustItem(null);
          }}
          onAdjusted={() => {
            setAdjustItem(null);
            onStockAdjusted?.();
          }}
        />
      )}
    </>
  );
}
