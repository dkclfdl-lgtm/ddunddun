'use client';

import { useState, useMemo, useCallback } from 'react';
import type {
  ExcelProductData,
  CategorySummary,
  PeriodComparison,
  PriceSimulation,
  ProductRecommendation,
  ColumnConfig,
  AnalyticsFilters,
} from './types';
import {
  getColumnConfigs,
  generateCategorySummaries,
  generatePeriodComparisons,
  generateRecommendations,
} from './mock';
import { useAnalyticsStore } from './store';
import {
  parseExcelFile,
  simulatePrice,
} from './utils';

export { useAnalyticsStore } from './store';

export function useExcelData(filters: AnalyticsFilters) {
  const uploadedData = useAnalyticsStore((s) => s.uploadedData);
  const rawData = uploadedData;

  const filteredData = useMemo(() => {
    let result = [...rawData];

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.categoryName));
    }

    // Search filter
    if (filters.searchProduct) {
      const search = filters.searchProduct.toLowerCase();
      result = result.filter(
        (p) =>
          p.productName.toLowerCase().includes(search) ||
          p.productCode.toLowerCase().includes(search)
      );
    }

    // Sales amount filter
    if (filters.minSalesAmount > 0) {
      result = result.filter((p) => p.actualSalesAmount >= filters.minSalesAmount);
    }
    if (filters.maxSalesAmount > 0) {
      result = result.filter((p) => p.actualSalesAmount <= filters.maxSalesAmount);
    }

    // Sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        const aVal = a[filters.sortBy as keyof ExcelProductData] ?? 0;
        const bVal = b[filters.sortBy as keyof ExcelProductData] ?? 0;
        const numA = typeof aVal === 'number' ? aVal : String(aVal);
        const numB = typeof bVal === 'number' ? bVal : String(bVal);
        if (typeof numA === 'number' && typeof numB === 'number') {
          return filters.sortOrder === 'asc' ? numA - numB : numB - numA;
        }
        const strA = String(numA);
        const strB = String(numB);
        return filters.sortOrder === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [rawData, filters]);

  const hasData = uploadedData.length > 0;

  return {
    data: filteredData,
    totalCount: rawData.length,
    hasData,
  };
}

export function useCategorySummary(data: ExcelProductData[]) {
  return useMemo<CategorySummary[]>(() => {
    if (data.length === 0) return [];
    return generateCategorySummaries(data);
  }, [data]);
}

export function usePeriodComparison(
  period: 'monthly' | 'weekly' | 'daily'
) {
  const uploadedData = useAnalyticsStore((s) => s.uploadedData);

  return useMemo<PeriodComparison[]>(() => {
    if (uploadedData.length === 0) return [];
    return generatePeriodComparisons(uploadedData, period);
  }, [uploadedData, period]);
}

export function usePriceSimulation() {
  const [simulations, setSimulations] = useState<PriceSimulation[]>([]);

  const simulate = useCallback(
    (product: ExcelProductData, newPrice: number) => {
      const result = simulatePrice(product, newPrice);
      setSimulations((prev) => {
        const existing = prev.findIndex(
          (s) => s.productCode === product.productCode
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = result;
          return updated;
        }
        return [...prev, result];
      });
      return result;
    },
    []
  );

  const batchSimulate = useCallback(
    (products: ExcelProductData[], priceChangePercent: number) => {
      const results = products.map((p) => {
        const newPrice = Math.floor(p.unitPrice * (1 + priceChangePercent / 100));
        return simulatePrice(p, newPrice);
      });
      setSimulations(results);
      return results;
    },
    []
  );

  const clearSimulations = useCallback(() => {
    setSimulations([]);
  }, []);

  return { simulations, simulate, batchSimulate, clearSimulations };
}

export function useProductRecommendations(data: ExcelProductData[]) {
  return useMemo<ProductRecommendation[]>(() => {
    if (data.length === 0) return [];
    return generateRecommendations(data);
  }, [data]);
}

export function useColumnManager() {
  const [columns, setColumns] = useState<ColumnConfig[]>(getColumnConfigs());

  const toggleColumn = useCallback((key: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  }, []);

  const toggleGroup = useCallback((group: string, visible: boolean) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.group === group ? { ...col, isVisible: visible } : col
      )
    );
  }, []);

  const resetColumns = useCallback(() => {
    setColumns(getColumnConfigs());
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((c) => c.isVisible),
    [columns]
  );

  const groups = useMemo(() => {
    const groupMap = new Map<string, ColumnConfig[]>();
    columns.forEach((col) => {
      const existing = groupMap.get(col.group) ?? [];
      existing.push(col);
      groupMap.set(col.group, existing);
    });
    return Array.from(groupMap.entries()).map(([name, cols]) => ({
      name,
      columns: cols,
      allVisible: cols.every((c) => c.isVisible),
      someVisible: cols.some((c) => c.isVisible),
    }));
  }, [columns]);

  return {
    columns,
    visibleColumns,
    groups,
    toggleColumn,
    toggleGroup,
    resetColumns,
  };
}

export function useExcelUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ExcelProductData[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const storeSetData = useAnalyticsStore((s) => s.setData);

  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      setProgress(0);
      setFileName(file.name);

      try {
        setProgress(20);

        // Validate file type
        const validExtensions = ['.xls', '.xlsx'];
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
        if (!validExtensions.includes(ext)) {
          throw new Error(
            '지원하지 않는 파일 형식입니다. .xls 또는 .xlsx 파일을 업로드해주세요.'
          );
        }

        setProgress(40);

        const data = await parseExcelFile(file);

        setProgress(80);

        console.log('[useExcelUpload] Parsed products:', data.length);
        if (data.length > 0) {
          const sample = data[0];
          console.log('[useExcelUpload] Sample:', sample.productName, 'category:', sample.categoryName, 'sales:', sample.actualSalesAmount);
          const totalRev = data.reduce((s, p) => s + (p.actualSalesAmount || 0), 0);
          console.log('[useExcelUpload] Total revenue:', totalRev);
        }

        if (data.length === 0) {
          throw new Error('파일에서 데이터를 찾을 수 없습니다.');
        }

        setParsedData(data);
        // Auto-import to store
        storeSetData(data, file.name);
        console.log('[useExcelUpload] Data stored in zustand');
        setProgress(100);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : '파일 처리 중 오류가 발생했습니다.';
        setError(message);
        setParsedData(null);
      } finally {
        setIsUploading(false);
      }
    },
    [storeSetData]
  );

  const importData = useCallback(() => {
    if (parsedData && fileName) {
      storeSetData(parsedData, fileName);
    }
  }, [parsedData, fileName, storeSetData]);

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
