'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { formatPercent } from '@/lib/format';
import { useCostData } from '../hooks';

// 6등분 색상 (순위 기반)
const RANK_COLORS = [
  { color: '#15803D', label: '상위 ~17%', desc: '매우 낮음' },
  { color: '#22C55E', label: '상위 17~33%', desc: '낮음' },
  { color: '#86EFAC', label: '상위 33~50%', desc: '적정' },
  { color: '#FACC15', label: '상위 50~67%', desc: '보통' },
  { color: '#F97316', label: '상위 67~83%', desc: '높음' },
  { color: '#DC2626', label: '상위 83~100%', desc: '매우 높음' },
] as const;

function getColorByRank(index: number, total: number): string {
  if (total <= 0) return RANK_COLORS[0].color;
  const segment = Math.min(
    Math.floor((index / total) * RANK_COLORS.length),
    RANK_COLORS.length - 1
  );
  return RANK_COLORS[segment].color;
}

export function CostComparisonChart() {
  const { menuItems, overview } = useCostData();

  const chartData = useMemo(() => {
    // 전체 메뉴를 원가율 기준 내림차순 정렬 (순위 기반 색상용)
    const allSorted = [...menuItems]
      .filter((m) => m.costRatio > 0)
      .sort((a, b) => b.costRatio - a.costRatio);
    const totalCount = allSorted.length;

    return allSorted.slice(0, 20).map((item, idx) => ({
      name:
        item.menuName.length > 10
          ? item.menuName.slice(0, 10) + '...'
          : item.menuName,
      fullName: item.menuName,
      costRatio: Number(item.costRatio.toFixed(1)),
      category: item.category,
      rankColor: getColorByRank(idx, totalCount),
    }));
  }, [menuItems]);

  const avgRatio = overview?.avgCostRatio ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">원가율 비교 (상위 20개)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 'dataMax']}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => [
                  formatPercent(Number(value)),
                  '원가율',
                ]}
                labelFormatter={(_, payload) => {
                  if (payload && payload.length > 0) {
                    const item = payload[0]?.payload;
                    return `${item?.fullName} (${item?.category})`;
                  }
                  return '';
                }}
              />
              <ReferenceLine
                x={avgRatio}
                stroke="#FF9500"
                strokeDasharray="3 3"
                label={{
                  value: `평균 ${formatPercent(avgRatio)}`,
                  position: 'top',
                  fontSize: 11,
                  fill: '#FF9500',
                }}
              />
              <Bar dataKey="costRatio" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rankColor}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs">
          {RANK_COLORS.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: seg.color }}
              />
              <span>{seg.label} ({seg.desc})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
