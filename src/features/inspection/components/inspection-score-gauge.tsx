'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InspectionScoreGaugeProps {
  score: number;
  maxScore: number;
  label?: string;
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return '#03C75A';
  if (percentage >= 60) return '#FFAA00';
  return '#FF4444';
}

export function InspectionScoreGauge({ score, maxScore, label = '점검 점수' }: InspectionScoreGaugeProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const color = getScoreColor(percentage);

  const data = [
    { name: 'score', value: percentage },
    { name: 'remaining', value: 100 - percentage },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative h-[160px] w-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                innerRadius={55}
                outerRadius={75}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="#F0F0F0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>
              {percentage}
            </span>
            <span className="text-xs text-muted-foreground">/ 100점</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {score}점 / {maxScore}점
        </p>
      </CardContent>
    </Card>
  );
}
