'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { DataTable } from '@/components/common';
import { StatusBadge } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/format';
import type { PurchaseOrder, PurchaseOrderStatus } from '../types';

const ORDER_STATUS_MAP: Record<PurchaseOrderStatus, { label: string; color: string }> = {
  draft: { label: '초안', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: '제출됨', color: 'bg-blue-100 text-blue-700' },
  approved: { label: '승인됨', color: 'bg-green-100 text-green-700' },
  received: { label: '입고완료', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: '취소됨', color: 'bg-red-100 text-red-700' },
};

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  onStatusChange: (id: string, status: PurchaseOrderStatus) => void;
}

export function PurchaseOrderTable({ orders, onStatusChange }: PurchaseOrderTableProps) {
  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'id',
      header: '발주번호',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue('id')}</span>
      ),
    },
    {
      accessorKey: 'storeName',
      header: '매장',
    },
    {
      accessorKey: 'supplier',
      header: '공급업체',
    },
    {
      id: 'itemCount',
      header: '품목 수',
      cell: ({ row }) => (
        <span>{row.original.items.length}건</span>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          총 금액
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.getValue('totalAmount'))}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => (
        <StatusBadge
          status={row.getValue('status')}
          statusMap={ORDER_STATUS_MAP}
        />
      ),
    },
    {
      accessorKey: 'orderedAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          발주일
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.getValue('orderedAt')),
    },
    {
      accessorKey: 'expectedAt',
      header: '예상 입고일',
      cell: ({ row }) => {
        const date = row.getValue('expectedAt') as string | null;
        return date ? formatDate(date) : '-';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original;
        const canSubmit = order.status === 'draft';
        const canApprove = order.status === 'submitted';
        const canReceive = order.status === 'approved';
        const canCancel = order.status !== 'received' && order.status !== 'cancelled';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canSubmit && (
                <DropdownMenuItem onClick={() => onStatusChange(order.id, 'submitted')}>
                  제출하기
                </DropdownMenuItem>
              )}
              {canApprove && (
                <DropdownMenuItem onClick={() => onStatusChange(order.id, 'approved')}>
                  승인하기
                </DropdownMenuItem>
              )}
              {canReceive && (
                <DropdownMenuItem onClick={() => onStatusChange(order.id, 'received')}>
                  입고 완료
                </DropdownMenuItem>
              )}
              {canCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onStatusChange(order.id, 'cancelled')}
                  >
                    취소하기
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={orders} />;
}
