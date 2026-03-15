'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeatmapChart } from '@/components/charts/heatmap-chart';
import { getHeatmapData } from '../mock';

const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}시`);

export function HourlyHeatmap() {
  const heatmapData = useMemo(() => {
    const raw = getHeatmapData();
    return raw.map((d) => ({
      x: d.hour,
      y: d.day,
      value: d.value,
    }));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">시간대별 매출 히트맵</CardTitle>
      </CardHeader>
      <CardContent>
        <HeatmapChart
          data={heatmapData}
          xLabels={hourLabels}
          yLabels={dayLabels}
          valueFormatter={(value) => `매출 지수: ${value}`}
        />
      </CardContent>
    </Card>
  );
}
