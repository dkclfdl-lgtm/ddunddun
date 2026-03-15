'use client';

import { ClipboardCheck, BarChart3, Award, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useInspectionStats } from '../hooks';
import { formatNumber, formatPercent } from '@/lib/format';

export function InspectionStats() {
  const { stats } = useInspectionStats();

  const statItems = [
    {
      title: '이번달 점검수',
      value: `${formatNumber(stats.totalThisMonth)}건`,
      icon: ClipboardCheck,
    },
    {
      title: '평균 점수',
      value: `${formatNumber(stats.avgScore)}점`,
      icon: BarChart3,
    },
    {
      title: 'A등급 비율',
      value: formatPercent(stats.gradeARatio, 0),
      icon: Award,
    },
    {
      title: '미해결 이슈',
      value: `${formatNumber(stats.unresolvedIssues)}건`,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-lg font-bold">{stat.value}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon size={18} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
