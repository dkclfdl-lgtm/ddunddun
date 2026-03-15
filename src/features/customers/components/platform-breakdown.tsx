'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PlatformBreakdownProps {
  data: { platform: string; count: number; avgRating: number }[];
}

const platformColors: Record<string, string> = {
  '네이버': '#03C75A',
  '카카오': '#FEE500',
  '구글': '#4285F4',
  '배민': '#2AC1BC',
  '요기요': '#FA0050',
  '쿠팡이츠': '#E84C3D',
  '직접': '#94A3B8',
};

export function PlatformBreakdown({ data }: PlatformBreakdownProps) {
  const chartData = data.map((d) => ({
    ...d,
    avgRatingLabel: d.avgRating.toFixed(1),
  }));

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">플랫폼별 리뷰</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(value, name) => {
                  if (name === 'count') return [`${value}건`, '리뷰 수'];
                  if (name === 'avgRating') return [`${Number(value).toFixed(1)}`, '평균 별점'];
                  return [value, name];
                }}
              />
              <Bar yAxisId="left" dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                {chartData.map((entry) => (
                  <Cell key={entry.platform} fill={platformColors[entry.platform] ?? '#94A3B8'} />
                ))}
              </Bar>
              <Bar yAxisId="right" dataKey="avgRating" radius={[4, 4, 0, 0]} barSize={16} fill="#FFB800" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.map((d) => (
            <div key={d.platform} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: platformColors[d.platform] ?? '#94A3B8' }}
              />
              <span className="text-muted-foreground">
                {d.platform} ({d.count}건, {d.avgRating.toFixed(1)}점)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
