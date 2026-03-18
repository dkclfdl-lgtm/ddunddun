'use client';

import {
  TrendingUp,
  TrendingDown,
  Calculator,
  Layers,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { useCostData } from '../hooks';

export function MenuOverview() {
  const { overview } = useCostData();

  if (!overview) return null;

  const cards = [
    {
      title: '총 메뉴 수',
      value: `${formatNumber(overview.totalMenus)}개`,
      sub: `${overview.categoryCount}개 카테고리`,
      icon: Layers,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      title: '평균 원가율',
      value: formatPercent(overview.avgCostRatio),
      sub: '전체 메뉴 기준',
      icon: Calculator,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      title: '최고 원가율 메뉴',
      value: overview.highestCostMenu
        ? formatPercent(overview.highestCostMenu.costRatio)
        : '-',
      sub: overview.highestCostMenu?.menuName ?? '-',
      icon: TrendingUp,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      title: '최저 원가율 메뉴',
      value: overview.lowestCostMenu
        ? formatPercent(overview.lowestCostMenu.costRatio)
        : '-',
      sub: overview.lowestCostMenu?.menuName ?? '-',
      icon: TrendingDown,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
