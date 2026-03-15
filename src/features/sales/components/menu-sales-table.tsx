'use client';

import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/common';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSalesByMenu } from '../hooks';
import type { SalesByMenuData, SalesFilters } from '../types';

interface MenuSalesTableProps {
  filters?: SalesFilters;
}

export function MenuSalesTable({ filters }: MenuSalesTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data, categories } = useSalesByMenu({
    ...filters,
    category: selectedCategory,
  });

  const top10 = useMemo(
    () => [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    [data]
  );

  const columns: ColumnDef<SalesByMenuData>[] = [
    {
      accessorKey: 'menuName',
      header: '상품명',
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('menuName')}</span>
      ),
    },
    {
      accessorKey: 'category',
      header: '분류',
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
          {row.getValue('category')}
        </span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          판매량
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-right block">{formatNumber(row.getValue('quantity'))}</span>
      ),
    },
    {
      accessorKey: 'revenue',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          매출액
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-right block font-medium">
          {formatCurrency(row.getValue('revenue'))}
        </span>
      ),
    },
    {
      accessorKey: 'percentage',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          비중(%)
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const pct = row.getValue('percentage') as number;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-muted rounded-full h-2">
              <div
                className="bg-[#03C75A] h-2 rounded-full"
                style={{ width: `${Math.min(pct * 5, 100)}%` }}
              />
            </div>
            <span className="text-sm">{formatPercent(pct)}</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top 10 Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">매출 TOP 10 메뉴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="menuName"
                  tick={{ fontSize: 12 }}
                  width={70}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#03C75A" radius={[0, 4, 4, 0]} name="매출액" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">메뉴별 매출 상세</CardTitle>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="전체 분류" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 분류</SelectItem>
              {categories.filter(Boolean).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            searchKey="menuName"
            searchPlaceholder="메뉴명 검색..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
