'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { useCostData, useCostAnalysisStore } from '../hooks';
import { generateCategorySummaries } from '../utils';
import { CHART_COLORS } from '@/constants';
import type { MenuItem, CostSimulation } from '../types';

export function CategoryCostChart() {
  const { menuItems, categories: originalCategories } = useCostData();
  const simulations = useCostAnalysisStore((s) => s.simulations);
  const [showSimulated, setShowSimulated] = useState(false);

  // 시뮬레이션 적용된 메뉴 아이템 생성
  const simulatedMenuItems = useMemo(() => {
    if (simulations.length === 0) return menuItems;
    return menuItems.map((item) => {
      const sim = simulations.find((s) => s.menuItemId === item.id);
      if (!sim) return item;
      return {
        ...item,
        cost: sim.simulatedCost,
        costRatio: sim.simulatedCostRatio,
      };
    });
  }, [menuItems, simulations]);

  const categories = useMemo(() => {
    if (showSimulated && simulations.length > 0) {
      return generateCategorySummaries(simulatedMenuItems);
    }
    return originalCategories;
  }, [showSimulated, simulations, simulatedMenuItems, originalCategories]);

  const pieData = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.category,
      value: cat.totalCost,
      count: cat.menuCount,
    }));
  }, [categories]);

  const barData = useMemo(() => {
    return [...categories]
      .sort((a, b) => b.avgCostRatio - a.avgCostRatio)
      .map((cat) => ({
        name: cat.category,
        avgCostRatio: Number(cat.avgCostRatio.toFixed(1)),
        menuCount: cat.menuCount,
        minCostRatio: Number(cat.minCostRatio.toFixed(1)),
        maxCostRatio: Number(cat.maxCostRatio.toFixed(1)),
      }));
  }, [categories]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Simulation toggle */}
      {simulations.length > 0 && (
        <div className="col-span-full flex items-center gap-2 mb-1">
          <Button
            variant={showSimulated ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSimulated(!showSimulated)}
          >
            {showSimulated ? '시뮬레이션 적용 중' : '시뮬레이션 적용 보기'}
          </Button>
          {showSimulated && (
            <span className="text-xs text-muted-foreground">
              {simulations.length}개 메뉴 시뮬레이션 반영됨
            </span>
          )}
        </div>
      )}

      {/* Pie chart - cost distribution by category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            카테고리별 원가 비중
            {showSimulated && <span className="text-xs text-primary ml-2">(시뮬레이션)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 0.05
                      ? `${name} ${(percent * 100).toFixed(0)}%`
                      : ''
                  }
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    '총 원가',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{
                    backgroundColor:
                      CHART_COLORS[idx % CHART_COLORS.length],
                  }}
                />
                <span className="truncate">{item.name}</span>
                <span className="text-muted-foreground ml-auto">
                  {item.count}개
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar chart - avg cost ratio by category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">카테고리별 평균 원가율</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'avgCostRatio')
                      return [formatPercent(Number(value)), '평균 원가율'];
                    return [formatPercent(Number(value)), String(name)];
                  }}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="avgCostRatio" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Category summary table */}
          <div className="rounded-md border mt-4 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-2 py-1.5 text-left">카테고리</th>
                  <th className="px-2 py-1.5 text-right">메뉴수</th>
                  <th className="px-2 py-1.5 text-right">평균 원가율</th>
                  <th className="px-2 py-1.5 text-right">최저</th>
                  <th className="px-2 py-1.5 text-right">최고</th>
                </tr>
              </thead>
              <tbody>
                {barData.map((cat) => (
                  <tr key={cat.name} className="border-b last:border-0">
                    <td className="px-2 py-1.5 font-medium">{cat.name}</td>
                    <td className="px-2 py-1.5 text-right">
                      {cat.menuCount}개
                    </td>
                    <td className="px-2 py-1.5 text-right font-semibold">
                      {formatPercent(cat.avgCostRatio)}
                    </td>
                    <td className="px-2 py-1.5 text-right text-green-600">
                      {formatPercent(cat.minCostRatio)}
                    </td>
                    <td className="px-2 py-1.5 text-right text-red-600">
                      {formatPercent(cat.maxCostRatio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
