'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COLORS } from '@/constants';
import { useChecklistProgress } from '../hooks';
import { ProgressRing } from './progress-ring';

export function ChecklistOverview() {
  const { sectionProgress, overall } = useChecklistProgress();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">전체 진행 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-6">
          {/* Overall */}
          <ProgressRing
            percent={overall.percent}
            size={110}
            strokeWidth={10}
            color="#03C75A"
            label="전체"
            sublabel={`${overall.progress}/${overall.total}`}
          />

          {/* Divider */}
          <div className="hidden h-20 w-px bg-border sm:block" />

          {/* Per-section */}
          <div className="flex flex-wrap items-center gap-4">
            {sectionProgress.map((sp, idx) => (
              <ProgressRing
                key={sp.id}
                percent={sp.percent}
                size={80}
                strokeWidth={6}
                color={CHART_COLORS[idx % CHART_COLORS.length]}
                label={sp.title}
                sublabel={`${sp.progress}/${sp.total}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
