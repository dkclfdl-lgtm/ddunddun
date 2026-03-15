'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { DataTable, StatusBadge } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate, formatPhone } from '@/lib/format';
import { ROUTES } from '@/constants';
import type { Staff } from '../types';

const ROLE_MAP: Record<string, { label: string; color: string }> = {
  manager: { label: '매니저', color: 'bg-purple-100 text-purple-700' },
  cook: { label: '주방', color: 'bg-orange-100 text-orange-700' },
  server: { label: '서빙', color: 'bg-blue-100 text-blue-700' },
  part_time: { label: '파트타임', color: 'bg-cyan-100 text-cyan-700' },
  delivery: { label: '배달', color: 'bg-green-100 text-green-700' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '재직중', color: 'bg-green-100 text-green-700' },
  inactive: { label: '퇴직', color: 'bg-red-100 text-red-700' },
  on_leave: { label: '휴직', color: 'bg-yellow-100 text-yellow-700' },
};

interface StaffTableProps {
  data: Staff[];
  onDelete: (id: string) => void;
}

export function StaffTable({ data, onDelete }: StaffTableProps) {
  const columns: ColumnDef<Staff>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => (
        <Link
          href={`${ROUTES.staff}/${row.original.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'role',
      header: '역할',
      cell: ({ row }) => {
        const config = ROLE_MAP[row.original.role];
        return (
          <Badge variant="outline" className={`border-transparent font-medium ${config?.color ?? ''}`}>
            {config?.label ?? row.original.role}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'storeName',
      header: '매장',
    },
    {
      accessorKey: 'phone',
      header: '연락처',
      cell: ({ row }) => formatPhone(row.original.phone),
    },
    {
      accessorKey: 'hireDate',
      header: '입사일',
      cell: ({ row }) => formatDate(row.original.hireDate),
    },
    {
      accessorKey: 'hourlyWage',
      header: '시급',
      cell: ({ row }) => formatCurrency(row.original.hourlyWage),
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => <StatusBadge status={row.original.status} statusMap={STATUS_MAP} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${ROUTES.staff}/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                상세보기
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="이름으로 검색..." />;
}
