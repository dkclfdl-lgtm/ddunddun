'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/format';
import { useCostData, useCostAnalysisStore } from '../hooks';
import { simulateCostByPercent, simulateCostChange } from '../utils';
import { CHART_COLORS } from '@/constants';
import type { MenuItem, Ingredient } from '../types';

type InputMode = 'percent' | 'price';

export function CostSimulator() {
  const { menuItems } = useCostData();
  const selectedMenuId = useCostAnalysisStore((s) => s.selectedMenuId);
  const selectMenu = useCostAnalysisStore((s) => s.selectMenu);
  const addSimulation = useCostAnalysisStore((s) => s.addSimulation);
  const [inputMode, setInputMode] = useState<InputMode>('percent');

  // Percent changes: ingredientName -> percent change
  const [percentChanges, setPercentChanges] = useState<Map<string, number>>(
    new Map()
  );
  // Direct price changes: ingredientName -> new unit price
  const [priceChanges, setPriceChanges] = useState<Map<string, number>>(
    new Map()
  );
  // Selling price override
  const [sellingPriceOverride, setSellingPriceOverride] = useState<number | null>(null);

  const selectedItem = useMemo(
    () => menuItems.find((m) => m.id === selectedMenuId) ?? null,
    [menuItems, selectedMenuId]
  );

  const updatePercentChange = useCallback(
    (name: string, pct: number) => {
      setPercentChanges((prev) => {
        const next = new Map(prev);
        if (pct === 0) next.delete(name);
        else next.set(name, pct);
        return next;
      });
    },
    []
  );

  const updatePriceChange = useCallback(
    (name: string, newPrice: number, originalPrice: number) => {
      setPriceChanges((prev) => {
        const next = new Map(prev);
        if (newPrice === originalPrice || newPrice <= 0) next.delete(name);
        else next.set(name, newPrice);
        return next;
      });
    },
    []
  );

  const resetChanges = useCallback(() => {
    setPercentChanges(new Map());
    setPriceChanges(new Map());
    setSellingPriceOverride(null);
  }, []);

  // Compute simulation based on the active input mode
  const effectiveSellingPrice = sellingPriceOverride ?? selectedItem?.sellingPrice ?? 0;

  const simulation = useMemo(() => {
    if (!selectedItem) return null;

    let simulatedCost: number;
    let simulatedCostRatio: number;

    if (inputMode === 'percent') {
      const result = simulateCostByPercent(selectedItem, percentChanges);
      simulatedCost = result.simulatedCost;
      simulatedCostRatio = result.simulatedCostRatio;
    } else {
      const result = simulateCostChange(selectedItem, priceChanges);
      simulatedCost = result.simulatedCost;
      simulatedCostRatio = result.simulatedCostRatio;
    }

    // 판매가 변경 시 원가율 재계산
    const sp = sellingPriceOverride ?? selectedItem.sellingPrice;
    if (sellingPriceOverride && sp > 0) {
      simulatedCostRatio = (simulatedCost / sp) * 100;
    }

    return {
      originalCost: selectedItem.cost,
      simulatedCost,
      originalCostRatio: selectedItem.costRatio,
      simulatedCostRatio,
      effectiveSellingPrice: sp,
    };
  }, [selectedItem, inputMode, percentChanges, priceChanges, sellingPriceOverride]);

  // Build simulated ingredient amounts for pie chart
  const simulatedIngredients = useMemo(() => {
    if (!selectedItem) return [];

    return selectedItem.ingredients.map((ing) => {
      let newAmount = ing.amount;
      if (inputMode === 'percent') {
        const pct = percentChanges.get(ing.name);
        if (pct !== undefined) {
          newAmount = ing.amount * (1 + pct / 100);
        }
      } else {
        const newPrice = priceChanges.get(ing.name);
        if (newPrice !== undefined && ing.unitPrice > 0) {
          newAmount = (newPrice / ing.unitPrice) * ing.amount;
        }
      }
      return {
        name: ing.name,
        originalAmount: ing.amount,
        newAmount: Math.round(newAmount),
      };
    });
  }, [selectedItem, inputMode, percentChanges, priceChanges]);

  // 시뮬레이션 결과를 스토어에 자동 저장 (카테고리 분석/보고서에서 활용)
  useEffect(() => {
    if (!simulation || !selectedItem) return;
    const hasChanges =
      percentChanges.size > 0 ||
      priceChanges.size > 0 ||
      sellingPriceOverride !== null;
    if (hasChanges) {
      const changes = selectedItem.ingredients
        .filter((ing) => {
          if (inputMode === 'percent') return percentChanges.has(ing.name);
          return priceChanges.has(ing.name);
        })
        .map((ing) => {
          const pct = percentChanges.get(ing.name) ?? 0;
          const newPrice = priceChanges.get(ing.name) ?? ing.unitPrice;
          return {
            ingredientName: ing.name,
            originalPrice: ing.unitPrice,
            newPrice: inputMode === 'percent' ? ing.unitPrice * (1 + pct / 100) : newPrice,
            changePercent: inputMode === 'percent' ? pct : ((newPrice - ing.unitPrice) / ing.unitPrice) * 100,
          };
        });
      addSimulation({
        menuItemId: selectedItem.id,
        originalCost: simulation.originalCost,
        simulatedCost: simulation.simulatedCost,
        originalCostRatio: simulation.originalCostRatio,
        simulatedCostRatio: simulation.simulatedCostRatio,
        changes,
      });
    }
  }, [simulation, selectedItem, percentChanges, priceChanges, sellingPriceOverride, inputMode, addSimulation]);

  const costDiff = simulation
    ? simulation.simulatedCost - simulation.originalCost
    : 0;
  const ratioDiff = simulation
    ? simulation.simulatedCostRatio - simulation.originalCostRatio
    : 0;

  return (
    <div className="space-y-4">
      {/* Menu selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">원가 시뮬레이션</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={inputMode === 'percent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMode('percent')}
              >
                % 비율 조정
              </Button>
              <Button
                variant={inputMode === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMode('price')}
              >
                단가 직접 입력
              </Button>
              <Button variant="outline" size="sm" onClick={resetChanges}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                초기화
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedMenuId ?? ''}
            onValueChange={(v) => {
              selectMenu(v);
              resetChanges();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="메뉴를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {menuItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      [{item.category}]
                    </span>
                    {item.menuName}
                    <span className="text-xs text-muted-foreground">
                      (원가율 {formatPercent(item.costRatio)})
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedItem && simulation && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard
              label="현재 원가"
              value={formatCurrency(simulation.originalCost)}
              sub={`원가율 ${formatPercent(simulation.originalCostRatio)}`}
            />
            <SummaryCard
              label="시뮬레이션 원가"
              value={formatCurrency(Math.round(simulation.simulatedCost))}
              sub={`원가율 ${formatPercent(simulation.simulatedCostRatio)}`}
              highlight
            />
            <SummaryCard
              label="원가 변동"
              value={`${costDiff >= 0 ? '+' : ''}${formatCurrency(Math.round(costDiff))}`}
              sub={`${ratioDiff >= 0 ? '+' : ''}${ratioDiff.toFixed(2)}%p`}
              color={costDiff > 0 ? 'red' : costDiff < 0 ? 'green' : undefined}
            />
            <div className="p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground">판매가</p>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={sellingPriceOverride ?? selectedItem.sellingPrice}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v === selectedItem.sellingPrice || v <= 0) {
                      setSellingPriceOverride(null);
                    } else {
                      setSellingPriceOverride(v);
                    }
                  }}
                  className="h-8 text-sm font-bold w-32 text-right"
                  min={0}
                  step={100}
                />
                <span className="text-xs text-muted-foreground">원</span>
              </div>
              <p className="text-xs mt-0.5 text-muted-foreground">
                {sellingPriceOverride
                  ? `기존 ${formatCurrency(selectedItem.sellingPrice)}`
                  : '직접 변경 가능'}
              </p>
            </div>
          </div>

          {/* Ingredient adjustments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">재료별 단가 조정</CardTitle>
              <p className="text-xs text-muted-foreground">
                {inputMode === 'percent'
                  ? '슬라이더를 조절하거나 직접 %를 입력하여 원가 변동을 시뮬레이션합니다'
                  : '새로운 단가(원)를 직접 입력하여 원가 변동을 시뮬레이션합니다'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedItem.ingredients.map((ing) => (
                <IngredientRow
                  key={ing.name}
                  ing={ing}
                  inputMode={inputMode}
                  percentChange={percentChanges.get(ing.name) ?? 0}
                  priceChange={priceChanges.get(ing.name)}
                  onPercentChange={(pct) =>
                    updatePercentChange(ing.name, pct)
                  }
                  onPriceChange={(price) =>
                    updatePriceChange(ing.name, price, ing.unitPrice)
                  }
                />
              ))}
            </CardContent>
          </Card>

          {/* Cost breakdown pie chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">원가 구성 비교</CardTitle>
              <p className="text-xs text-muted-foreground">
                현재 원가 구성 vs 시뮬레이션 원가 구성
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CostBreakdownPie
                  title="현재 원가"
                  data={selectedItem.ingredients.map((ing) => ({
                    name: ing.name,
                    value: Math.round(ing.amount),
                  }))}
                  total={selectedItem.cost}
                />
                <CostBreakdownPie
                  title="시뮬레이션 원가"
                  data={simulatedIngredients.map((si) => ({
                    name: si.name,
                    value: si.newAmount,
                  }))}
                  total={Math.round(simulation.simulatedCost)}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedItem && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-sm">
              메뉴를 선택하면 재료별 단가를 조정하여 원가 변동을
              시뮬레이션할 수 있습니다
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function IngredientRow({
  ing,
  inputMode,
  percentChange,
  priceChange,
  onPercentChange,
  onPriceChange,
}: {
  ing: Ingredient;
  inputMode: InputMode;
  percentChange: number;
  priceChange: number | undefined;
  onPercentChange: (pct: number) => void;
  onPriceChange: (price: number) => void;
}) {
  const currentNewPrice = priceChange ?? ing.unitPrice;
  let newAmount: number;
  let diff: number;

  if (inputMode === 'percent') {
    newAmount = ing.amount * (1 + percentChange / 100);
    diff = newAmount - ing.amount;
  } else {
    if (ing.unitPrice > 0 && priceChange !== undefined) {
      newAmount = (priceChange / ing.unitPrice) * ing.amount;
    } else {
      newAmount = ing.amount;
    }
    diff = newAmount - ing.amount;
  }

  return (
    <div className="p-3 rounded-lg border bg-background space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-sm font-medium">{ing.name}</span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted font-medium">
              {ing.quantity} {ing.unit}
            </span>
            <span>
              단가: {ing.unitPrice.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원
            </span>
            <span>
              금액: {formatCurrency(ing.amount)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatCurrency(ing.amount)}
          </span>
          <span className="text-xs font-medium">&rarr;</span>
          <span
            className={`text-xs font-semibold ${
              diff > 0
                ? 'text-red-600'
                : diff < 0
                  ? 'text-green-600'
                  : ''
            }`}
          >
            {formatCurrency(Math.round(newAmount))}
          </span>
        </div>
      </div>

      {inputMode === 'percent' ? (
        <div className="flex items-center gap-3">
          {/* Range slider */}
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={percentChange}
            onChange={(e) => onPercentChange(Number(e.target.value))}
            className="flex-1 h-2 accent-primary cursor-pointer"
          />
          {/* Percent input */}
          <div className="flex items-center gap-1 w-24">
            <Input
              type="number"
              value={percentChange}
              onChange={(e) => onPercentChange(Number(e.target.value) || 0)}
              className="h-7 text-xs text-right w-16"
              min={-100}
              max={200}
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          {/* Change indicator */}
          <div className="w-5">
            {percentChange > 0 && (
              <TrendingUp className="h-4 w-4 text-red-500" />
            )}
            {percentChange < 0 && (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
            {percentChange === 0 && (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {/* Current price display */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <span>현재:</span>
            <span className="font-medium">
              {ing.unitPrice.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원
            </span>
          </div>
          <span className="text-xs">&rarr;</span>
          {/* New price input */}
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={currentNewPrice || ''}
              onChange={(e) => onPriceChange(Number(e.target.value) || 0)}
              className="h-7 text-xs text-right w-24"
              min={0}
              step={0.1}
              placeholder={String(ing.unitPrice)}
            />
            <span className="text-xs text-muted-foreground shrink-0">
              원/{ing.unit}
            </span>
          </div>
          {/* Change indicator and percent */}
          <div className="flex items-center gap-1 text-xs shrink-0">
            {priceChange !== undefined && ing.unitPrice > 0 ? (
              <span
                className={`font-semibold ${
                  priceChange > ing.unitPrice
                    ? 'text-red-600'
                    : priceChange < ing.unitPrice
                      ? 'text-green-600'
                      : ''
                }`}
              >
                ({priceChange > ing.unitPrice ? '+' : ''}
                {(
                  ((priceChange - ing.unitPrice) / ing.unitPrice) *
                  100
                ).toFixed(1)}
                %)
              </span>
            ) : (
              <span className="text-muted-foreground">--</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CostBreakdownPie({
  title,
  data,
  total,
}: {
  title: string;
  data: Array<{ name: string; value: number }>;
  total: number;
}) {
  const chartData = data
    .map((d) => ({
      ...d,
      share: total > 0 ? (d.value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <p className="text-sm font-medium text-center mb-2">
        {title} ({formatCurrency(total)})
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              label={
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ((props: any) => {
                  const s = props.share as number;
                  return s > 8
                    ? `${(props.name as string).slice(0, 6)} ${s.toFixed(0)}%`
                    : '';
                }) as any
              }
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(label) => String(label)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1 mt-2">
        {chartData.slice(0, 5).map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{
                backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
              }}
            />
            <span className="flex-1 truncate">{item.name}</span>
            <span className="text-muted-foreground">
              {formatCurrency(item.value)}
            </span>
            <span className="w-10 text-right font-medium">
              {item.share.toFixed(1)}%
            </span>
          </div>
        ))}
        {chartData.length > 5 && (
          <p className="text-xs text-muted-foreground text-center">
            외 {chartData.length - 5}개 재료
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  highlight,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  color?: 'red' | 'green';
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        highlight ? 'border-primary bg-primary/5' : ''
      }`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-lg font-bold mt-0.5 ${
          color === 'red'
            ? 'text-red-600'
            : color === 'green'
              ? 'text-green-600'
              : ''
        }`}
      >
        {value}
      </p>
      <p
        className={`text-xs mt-0.5 ${
          color === 'red'
            ? 'text-red-500'
            : color === 'green'
              ? 'text-green-500'
              : 'text-muted-foreground'
        }`}
      >
        {sub}
      </p>
    </div>
  );
}
