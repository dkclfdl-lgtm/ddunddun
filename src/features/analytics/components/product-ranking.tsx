'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/format';
import { CHART_COLORS } from '@/constants';
import type { ExcelProductData } from '../types';

interface ProductRankingProps {
  data: ExcelProductData[];
}

type MetricKey = 'actualSalesAmount' | 'salesQuantity' | 'orderCount' | 'customerAverage';

const METRIC_OPTIONS: { key: MetricKey; label: string }[] = [
  { key: 'actualSalesAmount', label: '매출' },
  { key: 'salesQuantity', label: '판매량' },
  { key: 'orderCount', label: '주문수' },
  { key: 'customerAverage', label: '객단가' },
];

const TOP_OPTIONS = [10, 20, 50] as const;

export function ProductRanking({ data }: ProductRankingProps) {
  const [metric, setMetric] = useState<MetricKey>('actualSalesAmount');
  const [topN, setTopN] = useState<(typeof TOP_OPTIONS)[number]>(10);

  const rankedData = useMemo(() => {
    return [...data]
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, topN);
  }, [data, metric, topN]);

  const maxValue = rankedData.length > 0 ? rankedData[0][metric] : 1;

  const formatValue = (value: number) => {
    if (metric === 'actualSalesAmount' || metric === 'customerAverage') {
      return formatCurrency(value);
    }
    return formatNumber(value);
  };

  // Generate mini sparkline data (mock trend)
  const getSparklineData = (product: ExcelProductData) => {
    const base = product[metric];
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.floor(base / 7 * (0.7 + Math.random() * 0.6) * (1 + i * 0.02)),
    }));
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">상품 순위</CardTitle>
          <div className="flex gap-2">
            <div className="flex gap-1">
              {METRIC_OPTIONS.map((opt) => (
                <Button
                  key={opt.key}
                  variant={metric === opt.key ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setMetric(opt.key)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              {TOP_OPTIONS.map((n) => (
                <Button
                  key={n}
                  variant={topN === n ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setTopN(n)}
                >
                  Top {n}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {rankedData.map((product, index) => {
            const percentage = (product[metric] / maxValue) * 100;
            return (
              <div
                key={`${product.productCode}-${index}`}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span
                  className={`text-sm font-bold w-7 text-center ${
                    index < 3 ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{product.productName}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {product.categoryName}
                    </Badge>
                  </div>
                  <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
                <div className="w-16 h-8 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getSparklineData(product)}>
                      <Bar
                        dataKey="value"
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        radius={[1, 1, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <span className="text-sm font-medium w-28 text-right shrink-0">
                  {formatValue(product[metric])}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
