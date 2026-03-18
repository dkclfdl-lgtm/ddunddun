'use client';

import { useState, useMemo, useCallback } from 'react';
import { ArrowUpDown, ChevronDown, ChevronRight, Search, Filter, X, Download, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatPercent } from '@/lib/format';
import { useCostData, useCostAnalysisStore } from '../hooks';
import type { MenuItem } from '../types';

type SortKey = 'menuName' | 'category' | 'sellingPrice' | 'cost' | 'costRatio';
type SortOrder = 'asc' | 'desc';

export function MenuCostTable() {
  const { menuItems } = useCostData();
  const selectMenu = useCostAnalysisStore((s) => s.selectMenu);
  const selectedMenuId = useCostAnalysisStore((s) => s.selectedMenuId);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [costRatioMin, setCostRatioMin] = useState<string>('');
  const [costRatioMax, setCostRatioMax] = useState<string>('');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('costRatio');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Simulation state - now ingredient-level: menuId -> ingredientName -> newUnitPrice
  const [simulationMode, setSimulationMode] = useState(false);
  const [simChanges, setSimChanges] = useState<Record<string, number>>({});
  const [ingredientChanges, setIngredientChanges] = useState<
    Record<string, Record<string, number>>
  >({});

  const categories = useMemo(() => {
    const cats = new Set(menuItems.map((m) => m.category));
    return Array.from(cats).sort();
  }, [menuItems]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setCostRatioMin('');
    setCostRatioMax('');
    setPriceMin('');
    setPriceMax('');
    setSearch('');
  };

  const hasActiveFilters =
    selectedCategories.size > 0 ||
    costRatioMin !== '' ||
    costRatioMax !== '' ||
    priceMin !== '' ||
    priceMax !== '' ||
    search !== '';

  const filtered = useMemo(() => {
    let result = [...menuItems];

    if (selectedCategories.size > 0) {
      result = result.filter((m) => selectedCategories.has(m.category));
    }

    const minRatio = costRatioMin !== '' ? Number(costRatioMin) : null;
    const maxRatio = costRatioMax !== '' ? Number(costRatioMax) : null;
    if (minRatio !== null && !isNaN(minRatio)) {
      result = result.filter((m) => m.costRatio >= minRatio);
    }
    if (maxRatio !== null && !isNaN(maxRatio)) {
      result = result.filter((m) => m.costRatio <= maxRatio);
    }

    const minPrice = priceMin !== '' ? Number(priceMin) : null;
    const maxPrice = priceMax !== '' ? Number(priceMax) : null;
    if (minPrice !== null && !isNaN(minPrice)) {
      result = result.filter((m) => m.sellingPrice >= minPrice);
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      result = result.filter((m) => m.sellingPrice <= maxPrice);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.menuName.toLowerCase().includes(s) ||
          m.ingredients.some((ing) => ing.name.toLowerCase().includes(s))
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [
    menuItems,
    selectedCategories,
    costRatioMin,
    costRatioMax,
    priceMin,
    priceMax,
    search,
    sortKey,
    sortOrder,
  ]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const getCostRatioColor = (ratio: number) => {
    if (ratio >= 45) return 'text-red-600 bg-red-50';
    if (ratio >= 35) return 'text-orange-600 bg-orange-50';
    if (ratio >= 25) return 'text-green-600 bg-green-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getSimulatedCost = useCallback(
    (item: MenuItem) => {
      const ingChanges = ingredientChanges[item.id];
      const hasIngChanges = ingChanges && Object.keys(ingChanges).length > 0;
      const pctChange = simChanges[item.id] ?? 0;

      if (hasIngChanges) {
        // 재료별 단가 변경 기반 시뮬레이션
        let newTotalCost = 0;
        for (const ing of item.ingredients) {
          const newPrice = ingChanges[ing.name];
          if (newPrice !== undefined && newPrice > 0 && ing.unitPrice > 0) {
            newTotalCost += (newPrice / ing.unitPrice) * ing.amount;
          } else {
            newTotalCost += ing.amount;
          }
        }
        // Also apply percent change on top if set
        if (pctChange !== 0) {
          newTotalCost = newTotalCost * (1 + pctChange / 100);
        }
        const newRatio = item.sellingPrice > 0 ? (newTotalCost / item.sellingPrice) * 100 : 0;
        return { cost: newTotalCost, costRatio: newRatio };
      }

      if (pctChange === 0) return { cost: item.cost, costRatio: item.costRatio };
      const newCost = item.cost * (1 + pctChange / 100);
      const newRatio = item.sellingPrice > 0 ? (newCost / item.sellingPrice) * 100 : 0;
      return { cost: newCost, costRatio: newRatio };
    },
    [simChanges, ingredientChanges]
  );

  const handleSimChange = (itemId: string, value: string) => {
    const num = value === '' || value === '-' ? 0 : Number(value);
    setSimChanges((prev) => ({ ...prev, [itemId]: isNaN(num) ? 0 : num }));
  };

  const generateCSVReport = useCallback(
    (mode: 'before' | 'after') => {
      const header = ['카테고리', '메뉴명', '판매가', '원가', '원가율(%)'];
      const rows = filtered.map((item) => {
        if (mode === 'after') {
          const sim = getSimulatedCost(item);
          return [
            item.category,
            item.menuName,
            item.sellingPrice.toString(),
            Math.round(sim.cost).toString(),
            sim.costRatio.toFixed(1),
          ];
        }
        return [
          item.category,
          item.menuName,
          item.sellingPrice.toString(),
          item.cost.toString(),
          item.costRatio.toFixed(1),
        ];
      });

      const csvContent = [header, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mode === 'before' ? '원가보고서_변경전.csv' : '원가보고서_변경후.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
    [filtered, getSimulatedCost]
  );

  const SortHeader = ({
    label,
    field,
    align = 'left',
  }: {
    label: string;
    field: SortKey;
    align?: 'left' | 'right';
  }) => (
    <th
      className={`px-3 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <button
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => handleSort(field)}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>메뉴별 원가 목록</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="메뉴명 / 재료명 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-56"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-3.5 w-3.5 mr-1" />
                필터
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-4 min-w-4 text-[10px] px-1">
                    !
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-3.5 w-3.5 mr-1" />
                  초기화
                </Button>
              )}
            </div>
          </div>

          {/* Simulation toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={simulationMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSimulationMode(!simulationMode);
                if (simulationMode) {
                  setSimChanges({});
                  setIngredientChanges({});
                }
              }}
            >
              {simulationMode ? (
                <ToggleRight className="h-3.5 w-3.5 mr-1" />
              ) : (
                <ToggleLeft className="h-3.5 w-3.5 mr-1" />
              )}
              시뮬레이션 적용
            </Button>
            {simulationMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateCSVReport('before')}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  변경 전 보고서
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateCSVReport('after')}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  변경 후 보고서
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSimChanges({}); setIngredientChanges({}); }}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  시뮬레이션 초기화
                </Button>
              </>
            )}
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
              {/* Category multi-select */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  카테고리 (복수 선택)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedCategories.has(cat)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border hover:bg-muted'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cost ratio range */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    원가율 범위 (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="최소"
                      value={costRatioMin}
                      onChange={(e) => setCostRatioMin(e.target.value)}
                      className="h-8 text-xs"
                      min={0}
                      max={100}
                    />
                    <span className="text-xs text-muted-foreground">~</span>
                    <Input
                      type="number"
                      placeholder="최대"
                      value={costRatioMax}
                      onChange={(e) => setCostRatioMax(e.target.value)}
                      className="h-8 text-xs"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    판매가 범위 (원)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="최소"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="h-8 text-xs"
                      min={0}
                      step={1000}
                    />
                    <span className="text-xs text-muted-foreground">~</span>
                    <Input
                      type="number"
                      placeholder="최대"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="h-8 text-xs"
                      min={0}
                      step={1000}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm table-fixed" style={{ minWidth: simulationMode ? '850px' : '650px' }}>
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-2 py-2.5 text-left whitespace-nowrap" style={{ width: '36px' }} />
                <SortHeader label="카테고리" field="category" />
                <SortHeader label="메뉴명" field="menuName" />
                <SortHeader
                  label="판매가"
                  field="sellingPrice"
                  align="right"
                />
                <SortHeader label="원가" field="cost" align="right" />
                <SortHeader
                  label="원가율"
                  field="costRatio"
                  align="right"
                />
                {simulationMode && (
                  <>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">
                      변동(%)
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">
                      변경 원가
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">
                      변경 원가율
                    </th>
                  </>
                )}
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">
                  재료 수
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <MenuRow
                    key={item.id}
                    item={item}
                    isExpanded={isExpanded}
                    isSelected={selectedMenuId === item.id}
                    onToggle={() =>
                      setExpandedId(isExpanded ? null : item.id)
                    }
                    onSelect={() => selectMenu(item.id)}
                    getCostRatioColor={getCostRatioColor}
                    simulationMode={simulationMode}
                    simChange={simChanges[item.id] ?? 0}
                    onSimChange={(val) => handleSimChange(item.id, val)}
                    getSimulatedCost={getSimulatedCost}
                    ingredientChanges={ingredientChanges}
                    onIngredientPriceChange={(ingName, price) => {
                      setIngredientChanges((prev) => {
                        const menuChanges = { ...(prev[item.id] || {}) };
                        const originalPrice = item.ingredients.find(i => i.name === ingName)?.unitPrice ?? 0;
                        if (price === originalPrice || price < 0) {
                          delete menuChanges[ingName];
                        } else {
                          menuChanges[ingName] = price;
                        }
                        return { ...prev, [item.id]: menuChanges };
                      });
                    }}
                  />
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={simulationMode ? 10 : 7}
                    className="px-3 py-8 text-center text-sm text-muted-foreground"
                  >
                    검색 결과가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">
          총 {filtered.length}개 메뉴
          {hasActiveFilters && ` (전체 ${menuItems.length}개 중)`}
        </p>
      </CardContent>
    </Card>
  );
}

function MenuRow({
  item,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  getCostRatioColor,
  simulationMode,
  simChange,
  onSimChange,
  getSimulatedCost,
  ingredientChanges,
  onIngredientPriceChange,
}: {
  item: MenuItem;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  getCostRatioColor: (r: number) => string;
  simulationMode: boolean;
  simChange: number;
  onSimChange: (val: string) => void;
  getSimulatedCost: (item: MenuItem) => { cost: number; costRatio: number };
  ingredientChanges: Record<string, Record<string, number>>;
  onIngredientPriceChange: (ingName: string, price: number) => void;
}) {
  const simulated = simulationMode ? getSimulatedCost(item) : null;
  const hasIngredientChanges = ingredientChanges[item.id] && Object.keys(ingredientChanges[item.id]).length > 0;
  const hasAnyChange = simChange !== 0 || hasIngredientChanges;
  const colSpan = simulationMode ? 10 : 7;

  return (
    <>
      <tr
        className={`border-b hover:bg-muted/30 cursor-pointer transition-colors ${
          isSelected ? 'bg-primary/5' : ''
        }`}
        onClick={onSelect}
      >
        <td className="px-3 py-2.5 whitespace-nowrap">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
            {item.category}
          </span>
        </td>
        <td className="px-3 py-2.5 font-medium" style={{ maxWidth: '160px' }}>
          <span className="block truncate" title={item.menuName}>
            {item.menuName}
          </span>
        </td>
        <td className="px-3 py-2.5 text-right whitespace-nowrap" style={{ minWidth: '90px' }}>
          {formatCurrency(item.sellingPrice)}
        </td>
        <td className="px-3 py-2.5 text-right whitespace-nowrap" style={{ minWidth: '90px' }}>
          {formatCurrency(item.cost)}
        </td>
        <td className="px-3 py-2.5 text-right whitespace-nowrap" style={{ minWidth: '80px' }}>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getCostRatioColor(
              item.costRatio
            )}`}
          >
            {formatPercent(item.costRatio)}
          </span>
        </td>
        {simulationMode && (
          <>
            <td className="px-3 py-2.5 text-right whitespace-nowrap" style={{ minWidth: '80px' }}>
              <Input
                type="number"
                value={simChange === 0 ? '' : simChange}
                onChange={(e) => {
                  e.stopPropagation();
                  onSimChange(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="0"
                className="h-7 w-20 text-xs text-right"
                step={1}
              />
            </td>
            <td className="px-3 py-2.5 text-right whitespace-nowrap" style={{ minWidth: '90px' }}>
              {simulated && hasAnyChange ? (
                <span className={simulated.cost > item.cost ? 'text-red-600' : simulated.cost < item.cost ? 'text-green-600' : ''}>
                  {formatCurrency(Math.round(simulated.cost))}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </td>
            <td className="px-3 py-2.5 text-right whitespace-nowrap" style={{ minWidth: '80px' }}>
              {simulated && hasAnyChange ? (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getCostRatioColor(
                    simulated.costRatio
                  )}`}
                >
                  {formatPercent(simulated.costRatio)}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </td>
          </>
        )}
        <td className="px-3 py-2.5 text-right text-muted-foreground whitespace-nowrap">
          {item.ingredients.length}개
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={colSpan} className="px-3 py-3 bg-muted/20">
            <IngredientDetail
              item={item}
              simulationMode={simulationMode}
              ingredientPrices={ingredientChanges?.[item.id]}
              onIngredientPriceChange={onIngredientPriceChange}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function IngredientDetail({
  item,
  simulationMode,
  ingredientPrices,
  onIngredientPriceChange,
}: {
  item: MenuItem;
  simulationMode?: boolean;
  ingredientPrices?: Record<string, number>;
  onIngredientPriceChange?: (ingName: string, price: number) => void;
}) {
  return (
    <div className="ml-8 mr-4">
      <p className="text-xs font-semibold mb-2 text-muted-foreground">
        재료 상세 ({item.ingredients.length}개)
      </p>
      <div className="rounded-md border bg-background overflow-x-auto">
        <table className="w-full text-xs" style={{ minWidth: '700px' }}>
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-2 py-1.5 text-left whitespace-nowrap">No</th>
              <th className="px-2 py-1.5 text-left whitespace-nowrap" style={{ minWidth: '100px' }}>재료명</th>
              <th className="px-2 py-1.5 text-center whitespace-nowrap">단위</th>
              <th className="px-2 py-1.5 text-right whitespace-nowrap">투입량</th>
              <th className="px-2 py-1.5 text-right whitespace-nowrap">적용단가</th>
              <th className="px-2 py-1.5 text-right whitespace-nowrap">금액</th>
              <th className="px-2 py-1.5 text-right whitespace-nowrap" style={{ minWidth: '90px' }}>비중</th>
              {simulationMode && (
                <th className="px-2 py-1.5 text-right whitespace-nowrap" style={{ minWidth: '110px' }}>변경단가</th>
              )}
              <th className="px-2 py-1.5 text-right whitespace-nowrap" style={{ minWidth: '80px' }}>본사마진율</th>
              <th className="px-2 py-1.5 text-right whitespace-nowrap" style={{ minWidth: '80px' }}>본사마진액</th>
            </tr>
          </thead>
          <tbody>
            {item.ingredients.map((ing, idx) => {
              const totalCost = item.ingredients.reduce(
                (s, i) => s + i.amount,
                0
              );
              const share =
                totalCost > 0 ? (ing.amount / totalCost) * 100 : 0;
              return (
                <tr key={idx} className="border-b last:border-0">
                  <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">
                    {ing.no}
                  </td>
                  <td className="px-2 py-1.5 font-medium whitespace-nowrap">{ing.name}</td>
                  <td className="px-2 py-1.5 text-center whitespace-nowrap">{ing.unit}</td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">{ing.quantity}</td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">
                    {ing.unitPrice.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium whitespace-nowrap">
                    {formatCurrency(ing.amount)}
                  </td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(share, 100)}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground w-10 text-right">
                        {share.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  {simulationMode && (
                    <td className="px-2 py-1.5 text-right whitespace-nowrap">
                      <Input
                        type="number"
                        value={ingredientPrices?.[ing.name] ?? ing.unitPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            onIngredientPriceChange?.(ing.name, 0);
                          } else {
                            onIngredientPriceChange?.(ing.name, Number(val));
                          }
                        }}
                        className="h-6 w-24 text-xs text-right"
                        min={0}
                        step={Math.max(0.1, Math.round(ing.unitPrice * 0.01 * 10) / 10)}
                      />
                    </td>
                  )}
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">
                    {ing.hqMarginRate !== undefined && ing.hqMarginRate !== 0 ? (
                      <span className="text-blue-600">{formatPercent(ing.hqMarginRate)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap">
                    {ing.hqMarginAmount !== undefined && ing.hqMarginAmount !== 0 ? (
                      <span className="text-blue-600">{formatCurrency(ing.hqMarginAmount)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-muted/30 font-semibold">
              <td colSpan={5} className="px-2 py-1.5 text-right whitespace-nowrap">
                합계
              </td>
              <td className="px-2 py-1.5 text-right whitespace-nowrap">
                {formatCurrency(
                  item.ingredients.reduce((s, i) => s + i.amount, 0)
                )}
              </td>
              <td className="px-2 py-1.5 text-right whitespace-nowrap">100%</td>
              {simulationMode && <td className="px-2 py-1.5" />}
              <td className="px-2 py-1.5 text-right whitespace-nowrap">-</td>
              <td className="px-2 py-1.5 text-right whitespace-nowrap">
                {formatCurrency(
                  item.ingredients.reduce((s, i) => s + (i.hqMarginAmount ?? 0), 0)
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
