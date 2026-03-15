'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { CHART_COLORS } from '@/constants';
import { usePeriodComparison } from '../hooks';
import { useAnalyticsStore } from '../store';

type PeriodType = 'monthly' | 'weekly' | 'daily';

export function PeriodComparison() {
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const data = usePeriodComparison(period);
  const hasData = useAnalyticsStore((s) => s.uploadedData.length > 0);

  const periodOptions: { key: PeriodType; label: string }[] = [
    { key: 'monthly', label: '월별' },
    { key: 'weekly', label: '주별' },
    { key: 'daily', label: '일별' },
  ];

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          데이터가 없습니다
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          엑셀 파일을 업로드하면 기간별 비교 분석을 볼 수 있습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {periodOptions.map((opt) => (
            <Button
              key={opt.key}
              variant={period === opt.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(opt.key)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            막대
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            추세
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">매출 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(v: number) =>
                        `${Math.floor(v / 10000).toLocaleString()}만`
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        '매출',
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill={CHART_COLORS[0]}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(v: number) =>
                        `${Math.floor(v / 10000).toLocaleString()}만`
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        '매출',
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={CHART_COLORS[0]}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS[0], r: 4 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">주문수 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        formatNumber(Number(value)),
                        '주문수',
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="orders"
                      name="주문수"
                      fill={CHART_COLORS[1]}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="avgOrderValue"
                      name="평균객단가"
                      fill={CHART_COLORS[2]}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        formatNumber(Number(value)),
                        String(name) === 'orders'
                          ? '주문수'
                          : '평균객단가',
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      name="주문수"
                      stroke={CHART_COLORS[1]}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgOrderValue"
                      name="평균객단가"
                      stroke={CHART_COLORS[2]}
                      strokeWidth={2}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">기간별 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>기간</TableHead>
                  <TableHead className="text-right">매출</TableHead>
                  <TableHead className="text-right">주문수</TableHead>
                  <TableHead className="text-right">평균 객단가</TableHead>
                  <TableHead>인기 상품</TableHead>
                  <TableHead className="text-right">성장률</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.period}>
                    <TableCell className="font-medium">
                      {item.label}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(item.orders)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.avgOrderValue)}
                    </TableCell>
                    <TableCell>{item.topProduct}</TableCell>
                    <TableCell className="text-right">
                      {item.growthRate !== 0 && (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            item.growthRate > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {item.growthRate > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatPercent(Math.abs(item.growthRate))}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
