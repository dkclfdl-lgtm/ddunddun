'use client';

import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Target, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/format';
import {
  useCostData,
  useTargetCostSimulation,
  useCostAnalysisStore,
} from '../hooks';

const STRATEGY_LABELS: Record<string, { label: string; desc: string }> = {
  expensive_first: {
    label: '고비용 재료 우선',
    desc: '가장 비싼 재료부터 우선적으로 조정합니다',
  },
  equal: {
    label: '균등 조정',
    desc: '모든 재료를 동일한 비율로 조정합니다',
  },
  proportional: {
    label: '비중 비례',
    desc: '원가 비중에 비례하여 조정합니다',
  },
};

export function TargetSimulator() {
  const { menuItems } = useCostData();
  const selectedMenuId = useCostAnalysisStore((s) => s.selectedMenuId);
  const selectMenu = useCostAnalysisStore((s) => s.selectMenu);
  const {
    targetRatio,
    setTargetRatio,
    strategy,
    setStrategy,
    calculate,
  } = useTargetCostSimulation();

  const selectedItem = useMemo(
    () => menuItems.find((m) => m.id === selectedMenuId) ?? null,
    [menuItems, selectedMenuId]
  );

  const result = useMemo(() => {
    if (!selectedItem) return null;
    return calculate(selectedItem);
  }, [selectedItem, calculate]);

  // Check if the target is achievable (no ingredient needs > 50% change)
  const isAchievable = useMemo(() => {
    if (!result) return true;
    for (const [, pct] of result.changes) {
      if (Math.abs(pct) > 50) return false;
    }
    return true;
  }, [result]);

  return (
    <div className="space-y-4">
      {/* Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            목표 원가 시뮬레이션
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            목표 원가율을 설정하면, 해당 목표를 달성하기 위해 각 재료를 어떻게
            조정해야 하는지 계산합니다
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                메뉴 선택
              </label>
              <Select
                value={selectedMenuId ?? ''}
                onValueChange={(v) => selectMenu(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="메뉴 선택" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      [{item.category}] {item.menuName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                목표 원가율 (%)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={targetRatio}
                  onChange={(e) => setTargetRatio(Number(e.target.value) || 0)}
                  min={1}
                  max={100}
                  step={0.5}
                />
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={0.5}
                  value={targetRatio}
                  onChange={(e) => setTargetRatio(Number(e.target.value))}
                  className="flex-1 h-2 accent-primary cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                조정 전략
              </label>
              <Select
                value={strategy}
                onValueChange={(v) =>
                  setStrategy(
                    v as 'expensive_first' | 'equal' | 'proportional'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STRATEGY_LABELS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {strategy && (
            <p className="text-xs text-muted-foreground italic">
              {STRATEGY_LABELS[strategy]?.desc}
            </p>
          )}
        </CardContent>
      </Card>

      {selectedItem && result && (
        <>
          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-6 py-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    현재 원가율
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPercent(result.originalCostRatio)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(result.originalCost)}
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    목표 원가율
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatPercent(targetRatio)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(
                      Math.round(
                        (targetRatio / 100) * selectedItem.sellingPrice
                      )
                    )}
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    필요 절감액
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      result.costDiff < 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {result.costDiff >= 0 ? '+' : ''}
                    {formatCurrency(Math.round(result.costDiff))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {result.costDiff < 0 ? '절감 필요' : '여유 있음'}
                  </p>
                </div>
              </div>

              {/* Visual progress indicator */}
              <div className="mt-4 px-4">
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  {/* Target marker */}
                  <div
                    className="absolute top-0 h-full bg-primary/20 rounded-full"
                    style={{
                      width: `${Math.min(targetRatio, 100)}%`,
                    }}
                  />
                  {/* Current marker */}
                  <div
                    className="absolute top-0 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(result.originalCostRatio, 100)}%`,
                      backgroundColor:
                        result.originalCostRatio > targetRatio
                          ? '#E74C6F'
                          : '#03C75A',
                    }}
                  />
                  {/* Target line */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-primary"
                    style={{
                      left: `${Math.min(targetRatio, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Achievability notice */}
              <div className="mt-4 flex items-center gap-2 px-4">
                {isAchievable ? (
                  <div className="flex items-center gap-2 text-green-600 text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      목표 달성 가능 - 모든 재료를 50% 이내로 조정하여 달성할 수
                      있습니다
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 text-xs">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      일부 재료가 50% 이상 조정이 필요합니다. 현실적으로
                      달성하기 어려울 수 있습니다
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ingredient adjustments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">재료별 조정 방안</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                        재료명
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                        수량/단위
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                        현재 금액
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground min-w-[120px]">
                        조정 비율
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                        조정 후 금액
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                        차이
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItem.ingredients.map((ing) => {
                      const pct = result.changes.get(ing.name) ?? 0;
                      const newAmount = ing.amount * (1 + pct / 100);
                      const diff = newAmount - ing.amount;
                      const absPct = Math.abs(pct);
                      return (
                        <tr key={ing.name} className="border-b last:border-0">
                          <td className="px-3 py-2 font-medium">
                            {ing.name}
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-muted-foreground whitespace-nowrap">
                            {ing.quantity} {ing.unit}
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground">
                            {formatCurrency(ing.amount)}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              {/* Mini bar indicator */}
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    pct < 0 ? 'bg-green-500' : pct > 0 ? 'bg-red-500' : 'bg-gray-300'
                                  }`}
                                  style={{
                                    width: `${Math.min(absPct, 50) * 2}%`,
                                  }}
                                />
                              </div>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                                  pct < 0
                                    ? 'text-green-700 bg-green-50'
                                    : pct > 0
                                      ? 'text-red-700 bg-red-50'
                                      : 'text-gray-500'
                                }`}
                              >
                                {pct >= 0 ? '+' : ''}
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatCurrency(Math.round(newAmount))}
                          </td>
                          <td
                            className={`px-3 py-2 text-right text-xs font-semibold ${
                              diff < 0
                                ? 'text-green-600'
                                : diff > 0
                                  ? 'text-red-600'
                                  : ''
                            }`}
                          >
                            {diff >= 0 ? '+' : ''}
                            {formatCurrency(Math.round(diff))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 font-semibold text-sm">
                      <td className="px-3 py-2">합계</td>
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(result.originalCost)}
                      </td>
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2 text-right">
                        {formatCurrency(Math.round(result.simulatedCost))}
                      </td>
                      <td
                        className={`px-3 py-2 text-right ${
                          result.costDiff < 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {result.costDiff >= 0 ? '+' : ''}
                        {formatCurrency(Math.round(result.costDiff))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedItem && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-sm">
              메뉴를 선택하고 목표 원가율을 설정하면 조정 방안을
              계산합니다
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
