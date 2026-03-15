'use client';

import { Star, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber, formatPercent } from '@/lib/format';
import type { ReviewStats } from '../types';

interface ReviewStatsCardsProps {
  stats: ReviewStats;
}

export function ReviewStatsCards({ stats }: ReviewStatsCardsProps) {
  const kpis = [
    {
      title: '총 리뷰',
      value: `${formatNumber(stats.totalReviews)}건`,
      icon: MessageCircle,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: '평균 별점',
      value: stats.avgRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      title: '긍정 비율',
      value: formatPercent(stats.positiveRate),
      icon: ThumbsUp,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: '답글 완료율',
      value: formatPercent(stats.repliedRate),
      icon: ThumbsDown,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.title}</p>
                  <p className="mt-1 text-lg font-bold">{kpi.value}</p>
                </div>
                <div className={`rounded-lg p-2 ${kpi.color}`}>
                  <Icon size={18} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
