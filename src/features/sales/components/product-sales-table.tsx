'use client';

import { useState, useMemo, useCallback } from 'react';
import { ColumnDef, VisibilityState } from '@tanstack/react-table';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import {
  ArrowUpDown,
  Download,
  Columns,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useProductSales } from '../hooks';
import type { ProductSalesData, SalesFilters } from '../types';

interface ProductSalesTableProps {
  filters?: SalesFilters;
}

function currencyCell(value: number) {
  return <span className="text-right block tabular-nums">{formatCurrency(value)}</span>;
}

function numberCell(value: number) {
  return <span className="text-right block tabular-nums">{formatNumber(value)}</span>;
}

function sortableHeader(label: string, column: { toggleSorting: (desc: boolean) => void; getIsSorted: () => false | 'asc' | 'desc' }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 text-xs"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );
}

export function ProductSalesTable({ filters }: ProductSalesTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data, categories, summary } = useProductSales({
    ...filters,
    category: selectedCategory,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    categoryCode: false,
    salesDays: false,
    orderItems: false,
    cancelCount: false,
    cancelQuantity: false,
    discountQuantity: false,
    supplyPrice: false,
    vat: false,
    netSalesAmount: false,
    cashPayment: false,
    cardPayment: false,
    takeoutOrders: false,
    takeoutSales: false,
    deliveryOrders: false,
    deliverySales: false,
    dineInOrders: false,
    dineInSales: false,
    royaltyRate: false,
    royaltyAmount: false,
    normalSalesQty: false,
    serviceQuantity: false,
    returnQuantity: false,
    memberOrders: false,
    customerAverage: false,
    setQuantity: false,
    setAmount: false,
  });

  const columns: ColumnDef<ProductSalesData>[] = useMemo(
    () => [
      {
        accessorKey: 'productCode',
        header: '상품코드',
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('productCode')}</span>,
        size: 80,
      },
      {
        accessorKey: 'productName',
        header: '상품명',
        cell: ({ row }) => <span className="font-medium whitespace-nowrap">{row.getValue('productName')}</span>,
        size: 120,
      },
      {
        accessorKey: 'category',
        header: '분류',
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
            {row.getValue('category')}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: 'categoryCode',
        header: '분류코드',
        size: 80,
      },
      {
        accessorKey: 'salesDays',
        header: ({ column }) => sortableHeader('판매일수', column),
        cell: ({ row }) => numberCell(row.getValue('salesDays')),
        size: 80,
      },
      {
        accessorKey: 'orderCount',
        header: ({ column }) => sortableHeader('주문건수', column),
        cell: ({ row }) => numberCell(row.getValue('orderCount')),
        size: 90,
      },
      {
        accessorKey: 'orderItems',
        header: ({ column }) => sortableHeader('주문항목', column),
        cell: ({ row }) => numberCell(row.getValue('orderItems')),
        size: 90,
      },
      {
        accessorKey: 'orderQuantity',
        header: ({ column }) => sortableHeader('주문수량', column),
        cell: ({ row }) => numberCell(row.getValue('orderQuantity')),
        size: 90,
      },
      {
        accessorKey: 'unitPrice',
        header: ({ column }) => sortableHeader('단가', column),
        cell: ({ row }) => currencyCell(row.getValue('unitPrice')),
        size: 100,
      },
      {
        accessorKey: 'totalSalesAmount',
        header: ({ column }) => sortableHeader('총매출액', column),
        cell: ({ row }) => currencyCell(row.getValue('totalSalesAmount')),
        size: 120,
      },
      {
        accessorKey: 'cancelCount',
        header: ({ column }) => sortableHeader('취소건수', column),
        cell: ({ row }) => numberCell(row.getValue('cancelCount')),
        size: 90,
      },
      {
        accessorKey: 'cancelQuantity',
        header: ({ column }) => sortableHeader('취소수량', column),
        cell: ({ row }) => numberCell(row.getValue('cancelQuantity')),
        size: 90,
      },
      {
        accessorKey: 'cancelAmount',
        header: ({ column }) => sortableHeader('취소금액', column),
        cell: ({ row }) => currencyCell(row.getValue('cancelAmount')),
        size: 110,
      },
      {
        accessorKey: 'discountQuantity',
        header: ({ column }) => sortableHeader('할인수량', column),
        cell: ({ row }) => numberCell(row.getValue('discountQuantity')),
        size: 90,
      },
      {
        accessorKey: 'discountAmount',
        header: ({ column }) => sortableHeader('할인금액', column),
        cell: ({ row }) => currencyCell(row.getValue('discountAmount')),
        size: 110,
      },
      {
        accessorKey: 'actualSalesQty',
        header: ({ column }) => sortableHeader('실판매수량', column),
        cell: ({ row }) => numberCell(row.getValue('actualSalesQty')),
        size: 100,
      },
      {
        accessorKey: 'actualUnitPrice',
        header: ({ column }) => sortableHeader('실판매단가', column),
        cell: ({ row }) => currencyCell(row.getValue('actualUnitPrice')),
        size: 110,
      },
      {
        accessorKey: 'actualSalesAmount',
        header: ({ column }) => sortableHeader('실판매금액', column),
        cell: ({ row }) => currencyCell(row.getValue('actualSalesAmount')),
        size: 120,
      },
      {
        accessorKey: 'supplyPrice',
        header: ({ column }) => sortableHeader('공급가액', column),
        cell: ({ row }) => currencyCell(row.getValue('supplyPrice')),
        size: 110,
      },
      {
        accessorKey: 'vat',
        header: ({ column }) => sortableHeader('부가세', column),
        cell: ({ row }) => currencyCell(row.getValue('vat')),
        size: 100,
      },
      {
        accessorKey: 'netSalesAmount',
        header: ({ column }) => sortableHeader('순매출액', column),
        cell: ({ row }) => currencyCell(row.getValue('netSalesAmount')),
        size: 120,
      },
      {
        accessorKey: 'paymentAmount',
        header: ({ column }) => sortableHeader('결제금액', column),
        cell: ({ row }) => currencyCell(row.getValue('paymentAmount')),
        size: 120,
      },
      {
        accessorKey: 'cashPayment',
        header: ({ column }) => sortableHeader('현금결제', column),
        cell: ({ row }) => currencyCell(row.getValue('cashPayment')),
        size: 110,
      },
      {
        accessorKey: 'cardPayment',
        header: ({ column }) => sortableHeader('카드결제', column),
        cell: ({ row }) => currencyCell(row.getValue('cardPayment')),
        size: 110,
      },
      {
        accessorKey: 'dineInOrders',
        header: ({ column }) => sortableHeader('매장주문', column),
        cell: ({ row }) => numberCell(row.getValue('dineInOrders')),
        size: 90,
      },
      {
        accessorKey: 'dineInSales',
        header: ({ column }) => sortableHeader('매장매출', column),
        cell: ({ row }) => currencyCell(row.getValue('dineInSales')),
        size: 110,
      },
      {
        accessorKey: 'takeoutOrders',
        header: ({ column }) => sortableHeader('포장주문', column),
        cell: ({ row }) => numberCell(row.getValue('takeoutOrders')),
        size: 90,
      },
      {
        accessorKey: 'takeoutSales',
        header: ({ column }) => sortableHeader('포장매출', column),
        cell: ({ row }) => currencyCell(row.getValue('takeoutSales')),
        size: 110,
      },
      {
        accessorKey: 'deliveryOrders',
        header: ({ column }) => sortableHeader('배달주문', column),
        cell: ({ row }) => numberCell(row.getValue('deliveryOrders')),
        size: 90,
      },
      {
        accessorKey: 'deliverySales',
        header: ({ column }) => sortableHeader('배달매출', column),
        cell: ({ row }) => currencyCell(row.getValue('deliverySales')),
        size: 110,
      },
      {
        accessorKey: 'royaltyRate',
        header: '로열티율',
        cell: ({ row }) => <span className="text-right block">{formatPercent(row.getValue('royaltyRate'))}</span>,
        size: 80,
      },
      {
        accessorKey: 'royaltyAmount',
        header: ({ column }) => sortableHeader('로열티액', column),
        cell: ({ row }) => currencyCell(row.getValue('royaltyAmount')),
        size: 110,
      },
      {
        accessorKey: 'normalSalesQty',
        header: ({ column }) => sortableHeader('정상판매', column),
        cell: ({ row }) => numberCell(row.getValue('normalSalesQty')),
        size: 90,
      },
      {
        accessorKey: 'serviceQuantity',
        header: ({ column }) => sortableHeader('서비스', column),
        cell: ({ row }) => numberCell(row.getValue('serviceQuantity')),
        size: 80,
      },
      {
        accessorKey: 'returnQuantity',
        header: ({ column }) => sortableHeader('반품수량', column),
        cell: ({ row }) => numberCell(row.getValue('returnQuantity')),
        size: 90,
      },
      {
        accessorKey: 'memberOrders',
        header: ({ column }) => sortableHeader('회원주문', column),
        cell: ({ row }) => numberCell(row.getValue('memberOrders')),
        size: 90,
      },
      {
        accessorKey: 'customerAverage',
        header: ({ column }) => sortableHeader('객평균', column),
        cell: ({ row }) => currencyCell(row.getValue('customerAverage')),
        size: 100,
      },
      {
        accessorKey: 'setQuantity',
        header: ({ column }) => sortableHeader('세트수량', column),
        cell: ({ row }) => numberCell(row.getValue('setQuantity')),
        size: 90,
      },
      {
        accessorKey: 'setAmount',
        header: ({ column }) => sortableHeader('세트금액', column),
        cell: ({ row }) => currencyCell(row.getValue('setAmount')),
        size: 100,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: { pageSize: 20 },
    },
  });

  const exportToCSV = useCallback(() => {
    const visibleColumns = table.getVisibleFlatColumns();
    const headers = visibleColumns.map((col) => col.id).join(',');
    const rows = data.map((row) =>
      visibleColumns
        .map((col) => {
          const value = row[col.id as keyof ProductSalesData];
          return typeof value === 'string' ? `"${value}"` : value;
        })
        .join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `product-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [data, table]);

  const allColumnIds = columns.map((c) => ('accessorKey' in c ? (c.accessorKey as string) : ''));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-base">상품별 매출 상세</CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="상품명 검색..."
            value={(table.getColumn('productName')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('productName')?.setFilterValue(e.target.value)}
            className="w-[180px] h-9"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[120px] h-9">
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

          {/* Column visibility toggle */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Columns className="h-4 w-4 mr-1" />
                컬럼
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="end">
              <ScrollArea className="h-[300px] p-4">
                <div className="space-y-2">
                  {allColumnIds.filter(Boolean).map((colId) => {
                    const col = table.getColumn(colId);
                    if (!col) return null;
                    const colDef = columns.find(
                      (c) => 'accessorKey' in c && c.accessorKey === colId
                    );
                    const label =
                      typeof colDef?.header === 'string'
                        ? colDef.header
                        : colId;

                    return (
                      <div key={colId} className="flex items-center gap-2">
                        <Checkbox
                          checked={col.getIsVisible()}
                          onCheckedChange={(checked) => col.toggleVisibility(!!checked)}
                        />
                        <span className="text-xs">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" className="h-9" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap text-xs"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-xs whitespace-nowrap py-2">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {/* Summary row */}
                  <TableRow className="bg-muted/30 font-semibold border-t-2">
                    <TableCell className="text-xs">합계</TableCell>
                    <TableCell className="text-xs">-</TableCell>
                    <TableCell className="text-xs">-</TableCell>
                    {table.getColumn('categoryCode')?.getIsVisible() && <TableCell className="text-xs">-</TableCell>}
                    {table.getColumn('salesDays')?.getIsVisible() && <TableCell className="text-xs">-</TableCell>}
                    <TableCell className="text-xs text-right tabular-nums">
                      {formatNumber(summary.totalOrders)}
                    </TableCell>
                    {table.getColumn('orderItems')?.getIsVisible() && <TableCell className="text-xs">-</TableCell>}
                    <TableCell className="text-xs">-</TableCell>
                    <TableCell className="text-xs">-</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">
                      {formatCurrency(summary.totalSalesAmount)}
                    </TableCell>
                    {table.getColumn('cancelCount')?.getIsVisible() && <TableCell className="text-xs">-</TableCell>}
                    {table.getColumn('cancelQuantity')?.getIsVisible() && <TableCell className="text-xs">-</TableCell>}
                    <TableCell className="text-xs text-right tabular-nums">
                      {formatCurrency(summary.totalCancelAmount)}
                    </TableCell>
                    {table.getColumn('discountQuantity')?.getIsVisible() && <TableCell className="text-xs">-</TableCell>}
                    <TableCell className="text-xs text-right tabular-nums">
                      {formatCurrency(summary.totalDiscountAmount)}
                    </TableCell>
                    <TableCell className="text-xs">-</TableCell>
                    <TableCell className="text-xs">-</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">
                      {formatCurrency(summary.totalActualSales)}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-muted-foreground">
            총 {table.getFilteredRowModel().rows.length}개 상품
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
