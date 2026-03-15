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

interface RatingDistributionProps {
  data: { rating: number; count: number }[];
}

const ratingColors = ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E'];

export function RatingDistribution({ data }: RatingDistributionProps) {
  const chartData = [...data]
    .sort((a, b) => b.rating - a.rating)
    .map((item) => ({
      name: `${item.rating}점`,
      count: item.count,
      rating: item.rating,
    }));

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">별점 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {chartData.map((item) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            const colorIndex = item.rating - 1;
            return (
              <div key={item.rating} className="flex items-center gap-3">
                <span className="w-8 text-sm font-medium text-right">{item.name}</span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: ratingColors[colorIndex],
                    }}
                  />
                </div>
                <span className="w-12 text-sm text-muted-foreground text-right">
                  {item.count}건
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={35} />
              <Tooltip
                formatter={(value) => [`${value}건`, '리뷰 수']}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry) => (
                  <Cell key={entry.rating} fill={ratingColors[entry.rating - 1]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
