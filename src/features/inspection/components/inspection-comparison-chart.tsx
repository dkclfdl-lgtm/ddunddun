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
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInspectionStats } from '../hooks';

function getBarColor(score: number): string {
  if (score >= 80) return '#03C75A';
  if (score >= 60) return '#FFAA00';
  return '#FF4444';
}

export function InspectionComparisonChart() {
  const { storeScores } = useInspectionStats();

  const chartData = storeScores
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((s) => ({
      name: s.storeName,
      avgScore: s.avgScore,
      count: s.inspectionCount,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">매장별 평균 점검 점수</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}점`} />
              <Tooltip
                formatter={(value, _name, props) => {
                  const payload = props.payload as Record<string, number>;
                  return [`${value}점 (${payload.count}회 점검)`, '평균 점수'];
                }}
              />
              <ReferenceLine y={80} stroke="#03C75A" strokeDasharray="3 3" label={{ value: '80점', position: 'right', fontSize: 11 }} />
              <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={getBarColor(entry.avgScore)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
