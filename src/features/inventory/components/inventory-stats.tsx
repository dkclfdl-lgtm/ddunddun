'use client';

import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';

interface InventoryStatsProps {
  statusCounts: {
    all: number;
    normal: number;
    low: number;
    out: number;
    excess: number;
  };
}

export function InventoryStats({ statusCounts }: InventoryStatsProps) {
  const stats = [
    {
      title: '전체 품목',
      value: formatNumber(statusCounts.all),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '정상 재고',
      value: formatNumber(statusCounts.normal),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '부족 재고',
      value: formatNumber(statusCounts.low),
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: '재고 소진',
      value: formatNumber(statusCounts.out),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
