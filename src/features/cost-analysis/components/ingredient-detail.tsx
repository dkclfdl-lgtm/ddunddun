'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/format';
import type { MenuItem } from '../types';
import { CHART_COLORS } from '@/constants';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface IngredientDetailProps {
  item: MenuItem | null;
}

export function IngredientDetailCard({ item }: IngredientDetailProps) {
  if (!item) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-sm">메뉴를 선택하면 재료 상세를 볼 수 있습니다</p>
        </CardContent>
      </Card>
    );
  }

  const totalIngredientCost = item.ingredients.reduce(
    (s, i) => s + i.amount,
    0
  );

  const chartData = item.ingredients
    .map((ing) => ({
      name: ing.name,
      value: Math.round(ing.amount),
      share: totalIngredientCost > 0 ? (ing.amount / totalIngredientCost) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const truncateName = (name: string, max: number = 8) => {
    return name.length > max ? name.slice(0, max) + '...' : name;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, share, name } = props;
    const s = share as number;
    if (s <= 8) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 18;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#666"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={9}
      >
        {truncateName(name)} {s.toFixed(0)}%
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {item.menuName} - 재료 구성
        </CardTitle>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            판매가:{' '}
            <span className="font-semibold text-foreground">
              {formatCurrency(item.sellingPrice)}
            </span>
          </span>
          <span>
            원가:{' '}
            <span className="font-semibold text-foreground">
              {formatCurrency(item.cost)}
            </span>
          </span>
          <span>
            원가율:{' '}
            <span className="font-semibold text-foreground">
              {formatPercent(item.costRatio)}
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pie chart */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
                label={renderLabel}
                labelLine={{
                  stroke: '#ccc',
                  strokeWidth: 1,
                }}
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

        {/* Ingredient list */}
        <div className="space-y-1.5">
          {chartData.map((ing, idx) => (
            <div
              key={ing.name}
              className="flex items-center gap-2 text-xs"
            >
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{
                  backgroundColor:
                    CHART_COLORS[idx % CHART_COLORS.length],
                }}
              />
              <span className="flex-1 truncate">{ing.name}</span>
              <span className="text-muted-foreground">
                {formatCurrency(ing.value)}
              </span>
              <span className="w-12 text-right font-medium">
                {ing.share.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
