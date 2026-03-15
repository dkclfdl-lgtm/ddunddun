'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Percent, Gift, Trash2, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { ProductRecommendation } from '../types';

interface RecommendationPanelProps {
  recommendations: ProductRecommendation[];
}

const TYPE_CONFIG: Record<
  ProductRecommendation['type'],
  { label: string; icon: React.ElementType; color: string; bgColor: string; badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary' }
> = {
  price_increase: {
    label: '가격 인상 추천',
    icon: TrendingUp,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    badgeVariant: 'destructive',
  },
  price_decrease: {
    label: '가격 인하 추천',
    icon: TrendingDown,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    badgeVariant: 'default',
  },
  promotion: {
    label: '프로모션 추천',
    icon: Percent,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    badgeVariant: 'outline',
  },
  bundle: {
    label: '번들 추천',
    icon: Gift,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    badgeVariant: 'secondary',
  },
  discontinue: {
    label: '단종 검토',
    icon: Trash2,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
    badgeVariant: 'outline',
  },
  premium: {
    label: '프리미엄 추천',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    badgeVariant: 'secondary',
  },
};

export function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  const groupedRecommendations = useMemo(() => {
    const groups = new Map<ProductRecommendation['type'], ProductRecommendation[]>();
    recommendations.forEach((rec) => {
      const existing = groups.get(rec.type) ?? [];
      existing.push(rec);
      groups.set(rec.type, existing);
    });
    return groups;
  }, [recommendations]);

  const typeOrder: ProductRecommendation['type'][] = [
    'price_increase',
    'price_decrease',
    'promotion',
    'bundle',
    'discontinue',
    'premium',
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {typeOrder.map((type) => {
          const config = TYPE_CONFIG[type];
          const count = groupedRecommendations.get(type)?.length ?? 0;
          return (
            <Card key={type} className="border">
              <CardContent className="p-3 text-center">
                <config.icon className={`h-5 w-5 mx-auto ${config.color}`} />
                <p className="text-xs font-medium mt-1">{config.label}</p>
                <p className="text-lg font-bold mt-0.5">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {typeOrder.map((type) => {
          const recs = groupedRecommendations.get(type);
          if (!recs || recs.length === 0) return null;
          const config = TYPE_CONFIG[type];
          const TypeIcon = config.icon;

          return (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TypeIcon className={`h-4 w-4 ${config.color}`} />
                  {config.label}
                  <Badge variant={config.badgeVariant} className="ml-auto text-xs">
                    {recs.length}건
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recs.map((rec, idx) => (
                  <div
                    key={`${rec.productCode}-${idx}`}
                    className={`p-3 rounded-lg border ${config.bgColor}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{rec.productName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          현재: {rec.currentMetric > 10000
                            ? formatCurrency(rec.currentMetric)
                            : formatNumber(rec.currentMetric)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <p className="text-xs">
                        <span className="font-medium">제안: </span>
                        {rec.suggestedAction}
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">예상 효과: </span>
                        {rec.expectedImpact}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rec.reason}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">신뢰도</span>
                        <Progress value={rec.confidence * 100} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium">
                          {Math.floor(rec.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
