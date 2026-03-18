'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatCompactCurrency } from '@/lib/format';
import type { TagSummary as TagSummaryType } from '../types';

const CHART_COLORS = [
  '#03C75A',
  '#1A73E8',
  '#FF9500',
  '#9B59B6',
  '#E74C6F',
  '#00BCD4',
  '#FF6B6B',
  '#2ECC71',
];

interface TagSummaryProps {
  tags: TagSummaryType[];
}

export function TagSummary({ tags }: TagSummaryProps) {
  const pieData = tags.map((tag, i) => ({
    name: tag.tag,
    value: tag.totalSales,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">담당자별 매출 비율</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={50}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(1)}%)`
                  }
                  labelLine={true}
                  fontSize={11}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) => formatCompactCurrency(Number(value))}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">담당자별 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '650px' }}>
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground whitespace-nowrap" style={{ minWidth: '180px', maxWidth: '250px' }}>
                    담당자
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap" style={{ minWidth: '70px' }}>
                    매장 수
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap" style={{ minWidth: '100px' }}>
                    총 매출
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap" style={{ minWidth: '90px' }}>
                    주문건수
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap" style={{ minWidth: '100px' }}>
                    매장 평균
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground whitespace-nowrap" style={{ minWidth: '60px' }}>
                    비율
                  </th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag, i) => (
                  <tr key={tag.tag} className="border-b last:border-b-0">
                    <td className="py-2 px-3 whitespace-nowrap" style={{ maxWidth: '250px' }}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium whitespace-nowrap">{tag.tag}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={tag.stores.join(', ')}>
                            {tag.stores.join(', ')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      {tag.stores.length}개
                    </td>
                    <td className="py-2 px-3 text-right font-medium whitespace-nowrap">
                      {formatCompactCurrency(tag.totalSales)}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      {formatNumber(tag.totalOrders)}건
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      {formatCompactCurrency(tag.avgSalesPerStore)}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      {tag.salesRatio.toFixed(1)}%
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
