'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { DataTable } from '@/components/common';
import { StatusBadge } from '@/components/common';
import { formatDateTime } from '@/lib/format';
import type { InventoryLog } from '../types';

const LOG_TYPE_MAP = {
  in: { label: '입고', color: 'bg-green-100 text-green-700' },
  out: { label: '출고', color: 'bg-red-100 text-red-700' },
  adjust: { label: '조정', color: 'bg-blue-100 text-blue-700' },
} as const;

const TypeIcon = ({ type }: { type: InventoryLog['type'] }) => {
  if (type === 'in') return <ArrowDownCircle size={16} className="text-green-600" />;
  if (type === 'out') return <ArrowUpCircle size={16} className="text-red-600" />;
  return <RefreshCw size={16} className="text-blue-600" />;
};

interface InventoryLogTableProps {
  logs: InventoryLog[];
}

export function InventoryLogTable({ logs }: InventoryLogTableProps) {
  const columns: ColumnDef<InventoryLog>[] = [
    {
      accessorKey: 'createdAt',
      header: '일시',
      cell: ({ row }) => (
        <span className="text-sm">{formatDateTime(row.getValue('createdAt'))}</span>
      ),
    },
    {
      accessorKey: 'itemName',
      header: '품목',
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('itemName')}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: '유형',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <TypeIcon type={row.getValue('type')} />
          <StatusBadge
            status={row.getValue('type')}
            statusMap={LOG_TYPE_MAP}
          />
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: '수량',
      cell: ({ row }) => {
        const log = row.original;
        const prefix = log.type === 'in' ? '+' : log.type === 'out' ? '-' : '';
        return (
          <span
            className={`font-medium ${
              log.type === 'in'
                ? 'text-green-600'
                : log.type === 'out'
                  ? 'text-red-600'
                  : 'text-blue-600'
            }`}
          >
            {prefix}
            {log.quantity}
          </span>
        );
      },
    },
    {
      id: 'stockChange',
      header: '재고 변동',
      cell: ({ row }) => {
        const log = row.original;
        return (
          <span className="text-sm text-muted-foreground">
            {log.beforeStock} → {log.afterStock}
          </span>
        );
      },
    },
    {
      accessorKey: 'memo',
      header: '사유',
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate text-sm text-muted-foreground">
          {row.getValue('memo')}
        </span>
      ),
    },
    {
      accessorKey: 'createdBy',
      header: '처리자',
    },
  ];

  return <DataTable columns={columns} data={logs} pageSize={10} />;
}
