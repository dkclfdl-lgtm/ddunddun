'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts';
import { formatCurrency, formatPercent, formatCompactCurrency } from '@/lib/format';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSalesTargets } from '../hooks';

export function SalesTargetChart() {
  const { data, overallAchievement } = useSalesTargets();

  const radialData = [
    {
      name: '달성률',
      value: overallAchievement,
      fill: overallAchievement >= 100 ? '#03C75A' : overallAchievement >= 90 ? '#F59E0B' : '#EF4444',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Overall Achievement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">전체 목표 달성률</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={20}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    angleAxisId={0}
                  />
                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground"
                    style={{ fontSize: '28px', fontWeight: 'bold' }}
                  >
                    {formatPercent(overallAchievement)}
                  </text>
                  <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: '12px' }}
                  >
                    달성률
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">누적 목표</span>
                <p className="text-lg font-semibold">
                  {formatCompactCurrency(
                    data.filter((t) => t.actualRevenue > 0).reduce((s, t) => s + t.targetRevenue, 0)
                  )}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">누적 실적</span>
                <p className="text-lg font-semibold">
                  {formatCompactCurrency(
                    data.filter((t) => t.actualRevenue > 0).reduce((s, t) => s + t.actualRevenue, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly targets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">월별 목표 달성 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.map((target) => {
              const monthLabel = format(parseISO(`${target.month}-01`), 'M월', {
                locale: ko,
              });
              const isFuture = target.actualRevenue === 0;
              const rate = target.achievementRate;

              return (
                <div key={target.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{monthLabel}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {isFuture
                          ? `목표: ${formatCompactCurrency(target.targetRevenue)}`
                          : `${formatCompactCurrency(target.actualRevenue)} / ${formatCompactCurrency(target.targetRevenue)}`}
                      </span>
                      {!isFuture && (
                        <span
                          className={cn(
                            'text-xs font-medium',
                            rate >= 100
                              ? 'text-[#03C75A]'
                              : rate >= 90
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          )}
                        >
                          {formatPercent(rate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={isFuture ? 0 : Math.min(rate, 100)}
                    className={cn(
                      'h-3',
                      isFuture && 'opacity-30'
                    )}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
