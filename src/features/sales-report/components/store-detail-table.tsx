'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { SalesReportData } from '../types';

type SortField = 'storeName' | 'storeTag' | 'total' | string;
type SortDirection = 'asc' | 'desc' | 'none';

interface StoreDetailTableProps {
  data: SalesReportData;
}

export function StoreDetailTable({ data }: StoreDetailTableProps) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [channelView, setChannelView] = useState<'sales' | 'orders'>('sales');
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('none');

  const availableTags = useMemo(() => {
    const tags = new Set(data.stores.map((s) => s.storeTag).filter(Boolean));
    return Array.from(tags).sort();
  }, [data]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 3-way toggle: desc → asc → none (원상태)
      setSortDirection((d) => {
        if (d === 'desc') return 'asc';
        if (d === 'asc') return 'none';
        return 'desc';
      });
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field || sortDirection === 'none') {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  const filteredAndSortedStores = useMemo(() => {
    let stores = data.stores.filter((store) => {
      const matchSearch =
        !search ||
        store.storeName.toLowerCase().includes(search.toLowerCase());
      const matchTag = tagFilter === 'all' || store.storeTag === tagFilter;
      return matchSearch && matchTag;
    });

    if (sortDirection === 'none') return stores;

    stores = [...stores].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortField === 'storeName') {
        aVal = a.storeName;
        bVal = b.storeName;
      } else if (sortField === 'storeTag') {
        aVal = a.storeTag || '';
        bVal = b.storeTag || '';
      } else if (sortField === 'total') {
        aVal = channelView === 'sales' ? a.totalSales : a.totalOrders;
        bVal = channelView === 'sales' ? b.totalSales : b.totalOrders;
      } else {
        // Channel column
        const aCh = a.channels.find((c) => c.channelName === sortField);
        const bCh = b.channels.find((c) => c.channelName === sortField);
        aVal = channelView === 'sales' ? (aCh?.sales ?? 0) : (aCh?.orders ?? 0);
        bVal = channelView === 'sales' ? (bCh?.sales ?? 0) : (bCh?.orders ?? 0);
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return stores;
  }, [data, search, tagFilter, sortField, sortDirection, channelView]);

  const totals = useMemo(() => {
    const totalSales = filteredAndSortedStores.reduce((s, st) => s + st.totalSales, 0);
    const totalOrders = filteredAndSortedStores.reduce(
      (s, st) => s + st.totalOrders,
      0
    );
    const channelTotals = data.channels.map((ch) => {
      let sales = 0;
      let orders = 0;
      for (const store of filteredAndSortedStores) {
        const channel = store.channels.find((c) => c.channelName === ch);
        if (channel) {
          sales += channel.sales;
          orders += channel.orders;
        }
      }
      return { channelName: ch, sales, orders };
    });
    return { totalSales, totalOrders, channelTotals };
  }, [filteredAndSortedStores, data.channels]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">매장별 상세 데이터</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="매장명 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48"
            />
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="전체 담당자" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 담당자</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={channelView}
              onValueChange={(v) =>
                setChannelView(v as 'sales' | 'orders')
              }
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">매출액</SelectItem>
                <SelectItem value="orders">주문건수</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-[600px] border rounded-md">
          <table className="w-full text-xs" style={{ minWidth: 800 + data.channels.length * 90 }}>
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <tr>
                <th className="py-2 px-2 text-left font-medium border-b whitespace-nowrap min-w-[40px]">
                  #
                </th>
                <th
                  className="py-2 px-2 text-left font-medium border-b whitespace-nowrap min-w-[120px] cursor-pointer select-none hover:bg-muted/60"
                  onClick={() => handleSort('storeName')}
                >
                  <span className="inline-flex items-center">
                    매장
                    <SortIcon field="storeName" />
                  </span>
                </th>
                <th
                  className="py-2 px-2 text-left font-medium border-b whitespace-nowrap min-w-[80px] cursor-pointer select-none hover:bg-muted/60"
                  onClick={() => handleSort('storeTag')}
                >
                  <span className="inline-flex items-center">
                    태그
                    <SortIcon field="storeTag" />
                  </span>
                </th>
                <th
                  className="py-2 px-2 text-right font-medium border-b whitespace-nowrap min-w-[100px] cursor-pointer select-none hover:bg-muted/60"
                  onClick={() => handleSort('total')}
                >
                  <span className="inline-flex items-center justify-end">
                    합계
                    <SortIcon field="total" />
                  </span>
                </th>
                {data.channels.map((ch) => (
                  <th
                    key={ch}
                    className="py-2 px-2 text-right font-medium border-b whitespace-nowrap min-w-[90px] cursor-pointer select-none hover:bg-muted/60"
                    onClick={() => handleSort(ch)}
                  >
                    <span className="inline-flex items-center justify-end">
                      {ch}
                      <SortIcon field={ch} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedStores.map((store, i) => (
                <tr
                  key={store.storeName}
                  className="border-b last:border-b-0 hover:bg-muted/30"
                >
                  <td className="py-1.5 px-2 text-muted-foreground whitespace-nowrap">
                    {i + 1}
                  </td>
                  <td className="py-1.5 px-2 font-medium whitespace-nowrap">
                    {store.storeName}
                  </td>
                  <td className="py-1.5 px-2 text-muted-foreground whitespace-nowrap">
                    {store.storeTag}
                  </td>
                  <td className="py-1.5 px-2 text-right font-semibold whitespace-nowrap">
                    {channelView === 'sales'
                      ? formatCurrency(store.totalSales)
                      : `${formatNumber(store.totalOrders)}건`}
                  </td>
                  {data.channels.map((ch) => {
                    const channel = store.channels.find(
                      (c) => c.channelName === ch
                    );
                    const value =
                      channelView === 'sales'
                        ? channel?.sales ?? 0
                        : channel?.orders ?? 0;
                    return (
                      <td
                        key={ch}
                        className={`py-1.5 px-2 text-right ${
                          value === 0 ? 'text-muted-foreground/40' : ''
                        }`}
                      >
                        {value === 0
                          ? '-'
                          : channelView === 'sales'
                            ? formatCurrency(value)
                            : `${formatNumber(value)}건`}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Total row */}
              <tr className="bg-muted/50 font-semibold border-t-2">
                <td className="py-2 px-2" colSpan={2}>
                  합계 ({filteredAndSortedStores.length}개 매장)
                </td>
                <td className="py-2 px-2" />
                <td className="py-2 px-2 text-right">
                  {channelView === 'sales'
                    ? formatCurrency(totals.totalSales)
                    : `${formatNumber(totals.totalOrders)}건`}
                </td>
                {totals.channelTotals.map((ct) => (
                  <td key={ct.channelName} className="py-2 px-2 text-right">
                    {channelView === 'sales'
                      ? formatCurrency(ct.sales)
                      : `${formatNumber(ct.orders)}건`}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {filteredAndSortedStores.length}개 매장 표시 (전체 {data.stores.length}개)
        </p>
      </CardContent>
    </Card>
  );
}
