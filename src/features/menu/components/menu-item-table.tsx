'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Eye, Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/common';
import { formatCurrency, formatNumber } from '@/lib/format';
import { ROUTES } from '@/constants';
import type { MenuItem } from '../types';

interface MenuItemTableProps {
  items: MenuItem[];
  onToggleAvailable: (id: string, isAvailable: boolean) => void;
  onTogglePopular: (id: string, isPopular: boolean) => void;
  onDelete: (id: string) => void;
}

export function MenuItemTable({
  items,
  onToggleAvailable,
  onTogglePopular,
  onDelete,
}: MenuItemTableProps) {
  const columns = useMemo<ColumnDef<MenuItem, unknown>[]>(
    () => [
      {
        accessorKey: 'imageUrl',
        header: '이미지',
        cell: ({ row }) => {
          const imageUrl = row.original.imageUrl;
          return (
            <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={row.original.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  N/A
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            상품명
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <Link
            href={ROUTES.menuItemDetail(row.original.id)}
            className="font-medium text-foreground hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'code',
        header: '코드',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono">{row.original.code}</span>
        ),
      },
      {
        accessorKey: 'categoryName',
        header: '카테고리',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.categoryName}
          </Badge>
        ),
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            가격
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{formatCurrency(row.original.price)}</span>
        ),
      },
      {
        accessorKey: 'costPrice',
        header: '원가',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatCurrency(row.original.costPrice)}</span>
        ),
      },
      {
        accessorKey: 'salesCount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            판매량
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => formatNumber(row.original.salesCount),
      },
      {
        accessorKey: 'revenue',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            매출
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => formatCurrency(row.original.revenue),
      },
      {
        accessorKey: 'isAvailable',
        header: '상태',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.original.isAvailable}
              onCheckedChange={(checked) => onToggleAvailable(row.original.id, checked)}
              className="scale-75"
            />
            <span
              className={
                row.original.isAvailable ? 'text-green-600 text-xs' : 'text-red-500 text-xs'
              }
            >
              {row.original.isAvailable ? '판매중' : '품절'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'isPopular',
        header: '인기',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onTogglePopular(row.original.id, !row.original.isPopular)}
            className="p-1"
          >
            <Star
              className={
                row.original.isPopular
                  ? 'h-4 w-4 fill-yellow-400 text-yellow-400'
                  : 'h-4 w-4 text-muted-foreground'
              }
            />
          </button>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={ROUTES.menuItemDetail(row.original.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  상세보기
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={ROUTES.menuItemEdit(row.original.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  수정
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onToggleAvailable, onTogglePopular, onDelete]
  );

  return <DataTable columns={columns} data={items} searchKey="name" searchPlaceholder="메뉴 검색..." />;
}
