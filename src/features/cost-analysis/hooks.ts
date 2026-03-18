'use client';

import { useState, useMemo, useCallback } from 'react';
import type { MenuItem, CostSimulation, IngredientChange } from './types';
import { parseCostExcel, simulateCostByPercent, calculateTargetSimulation, generateCategorySummaries } from './utils';
import { useCostAnalysisStore } from './store';

export { useCostAnalysisStore } from './store';

export function useCostUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const storeSetData = useCostAnalysisStore((s) => s.setData);

  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const validExtensions = ['.xls', '.xlsx'];
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
        if (!validExtensions.includes(ext)) {
          throw new Error(
            '지원하지 않는 파일 형식입니다. .xls 또는 .xlsx 파일을 업로드해주세요.'
          );
        }

        setProgress(20);
        const data = await parseCostExcel(file);
        setProgress(80);

        if (data.length === 0) {
          throw new Error(
            '원가표 데이터를 찾을 수 없습니다. 올바른 원가표 엑셀 파일인지 확인해주세요.'
          );
        }

        storeSetData(data, file.name);
        setProgress(100);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : '파일 처리 중 오류가 발생했습니다.';
        setError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [storeSetData]
  );

  const reset = useCallback(() => {
    setError(null);
    setProgress(0);
  }, []);

  return { isUploading, progress, error, upload, reset };
}

export function useCostData() {
  const menuItems = useCostAnalysisStore((s) => s.menuItems);
  const fileName = useCostAnalysisStore((s) => s.fileName);
  const uploadedAt = useCostAnalysisStore((s) => s.uploadedAt);
  const hasData = menuItems.length > 0;

  const categories = useMemo(() => {
    return generateCategorySummaries(menuItems);
  }, [menuItems]);

  const overview = useMemo(() => {
    if (menuItems.length === 0) return null;
    const validItems = menuItems.filter((m) => m.costRatio > 0);
    const avgCostRatio =
      validItems.length > 0
        ? validItems.reduce((s, m) => s + m.costRatio, 0) / validItems.length
        : 0;
    const sorted = [...validItems].sort((a, b) => a.costRatio - b.costRatio);
    return {
      totalMenus: menuItems.length,
      avgCostRatio,
      highestCostMenu: sorted[sorted.length - 1] ?? null,
      lowestCostMenu: sorted[0] ?? null,
      categoryCount: new Set(menuItems.map((m) => m.category)).size,
    };
  }, [menuItems]);

  return { menuItems, fileName, uploadedAt, hasData, categories, overview };
}

export function useCostSimulation() {
  const [priceChanges, setPriceChanges] = useState<Map<string, number>>(
    new Map()
  );

  const updateIngredientPercent = useCallback(
    (ingredientName: string, percent: number) => {
      setPriceChanges((prev) => {
        const next = new Map(prev);
        if (percent === 0) {
          next.delete(ingredientName);
        } else {
          next.set(ingredientName, percent);
        }
        return next;
      });
    },
    []
  );

  const simulate = useCallback(
    (item: MenuItem): CostSimulation => {
      const { simulatedCost, simulatedCostRatio } = simulateCostByPercent(
        item,
        priceChanges
      );

      const changes: IngredientChange[] = [];
      for (const ing of item.ingredients) {
        const pct = priceChanges.get(ing.name);
        if (pct !== undefined && pct !== 0) {
          changes.push({
            ingredientName: ing.name,
            originalPrice: ing.unitPrice,
            newPrice: ing.unitPrice * (1 + pct / 100),
            changePercent: pct,
          });
        }
      }

      return {
        menuItemId: item.id,
        originalCost: item.cost,
        simulatedCost,
        originalCostRatio: item.costRatio,
        simulatedCostRatio,
        changes,
      };
    },
    [priceChanges]
  );

  const resetChanges = useCallback(() => {
    setPriceChanges(new Map());
  }, []);

  return {
    priceChanges,
    updateIngredientPercent,
    simulate,
    resetChanges,
  };
}

export function useTargetCostSimulation() {
  const [targetRatio, setTargetRatio] = useState<number>(30);
  const [strategy, setStrategy] = useState<
    'expensive_first' | 'equal' | 'proportional'
  >('proportional');

  const calculate = useCallback(
    (item: MenuItem) => {
      const changes = calculateTargetSimulation(item, targetRatio, strategy);
      const { simulatedCost, simulatedCostRatio } = simulateCostByPercent(
        item,
        changes
      );

      return {
        targetRatio,
        strategy,
        changes,
        simulatedCost,
        simulatedCostRatio,
        originalCost: item.cost,
        originalCostRatio: item.costRatio,
        costDiff: simulatedCost - item.cost,
      };
    },
    [targetRatio, strategy]
  );

  return {
    targetRatio,
    setTargetRatio,
    strategy,
    setStrategy,
    calculate,
  };
}
