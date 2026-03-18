'use client';

import { useCallback, useMemo, useState } from 'react';
import { parseSalesReportExcel } from './utils';
import { useSalesReportStore } from './store';
import type {
  SalesReportData,
  ChannelSummary,
  TagSummary,
  StoreSummary,
} from './types';

export function useReportUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<SalesReportData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const setReportData = useSalesReportStore((s) => s.setReportData);

  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setProgress(10);
    setFileName(file.name);

    try {
      setProgress(30);
      const buffer = await file.arrayBuffer();
      setProgress(60);
      const data = parseSalesReportExcel(buffer);
      setProgress(90);
      setParsedData(data);
      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '파일을 파싱하는 중 오류가 발생했습니다.'
      );
    } finally {
      setIsUploading(false);
    }
  }, []);

  const importData = useCallback(() => {
    if (parsedData && fileName) {
      setReportData(parsedData, fileName);
    }
  }, [parsedData, fileName, setReportData]);

  const reset = useCallback(() => {
    setParsedData(null);
    setFileName(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    isUploading,
    progress,
    error,
    parsedData,
    fileName,
    upload,
    importData,
    reset,
  };
}

export function useStoreSummary(data: SalesReportData | null): StoreSummary[] {
  return useMemo(() => {
    if (!data) return [];

    return data.stores
      .map((store) => {
        const topChannel = store.channels.reduce(
          (max, ch) => (ch.sales > max.sales ? ch : max),
          store.channels[0]
        );

        return {
          storeName: store.storeName,
          storeTag: store.storeTag,
          totalSales: store.totalSales,
          totalOrders: store.totalOrders,
          avgOrderValue:
            store.totalOrders > 0
              ? Math.round(store.totalSales / store.totalOrders)
              : 0,
          topChannel: topChannel?.channelName ?? '-',
          topChannelSales: topChannel?.sales ?? 0,
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [data]);
}

export function useChannelSummary(
  data: SalesReportData | null
): ChannelSummary[] {
  return useMemo(() => {
    if (!data) return [];

    const grandTotal = data.stores.reduce((s, st) => s + st.totalSales, 0);

    return data.channels.map((channelName) => {
      let totalSales = 0;
      let totalOrders = 0;
      let storeCount = 0;

      for (const store of data.stores) {
        const ch = store.channels.find((c) => c.channelName === channelName);
        if (ch && ch.sales > 0) {
          totalSales += ch.sales;
          totalOrders += ch.orders;
          storeCount++;
        }
      }

      return {
        channelName,
        totalSales,
        totalOrders,
        avgSalesPerStore: storeCount > 0 ? Math.round(totalSales / storeCount) : 0,
        storeCount,
        salesRatio: grandTotal > 0 ? (totalSales / grandTotal) * 100 : 0,
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
  }, [data]);
}

export function useTagSummary(data: SalesReportData | null): TagSummary[] {
  return useMemo(() => {
    if (!data) return [];

    const grandTotal = data.stores.reduce((s, st) => s + st.totalSales, 0);
    const tagMap = new Map<
      string,
      { stores: string[]; totalSales: number; totalOrders: number }
    >();

    for (const store of data.stores) {
      const tag = store.storeTag || '미지정';
      const entry = tagMap.get(tag) || {
        stores: [],
        totalSales: 0,
        totalOrders: 0,
      };
      entry.stores.push(store.storeName);
      entry.totalSales += store.totalSales;
      entry.totalOrders += store.totalOrders;
      tagMap.set(tag, entry);
    }

    return Array.from(tagMap.entries())
      .map(([tag, entry]) => ({
        tag,
        stores: entry.stores,
        totalSales: entry.totalSales,
        totalOrders: entry.totalOrders,
        avgSalesPerStore:
          entry.stores.length > 0
            ? Math.round(entry.totalSales / entry.stores.length)
            : 0,
        salesRatio: grandTotal > 0 ? (entry.totalSales / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [data]);
}
