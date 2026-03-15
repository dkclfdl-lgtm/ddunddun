'use client';

import { UtensilsCrossed, ShoppingCart, XCircle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';

interface MenuStatsProps {
  total: number;
  available: number;
  unavailable: number;
  popular: number;
}

export function MenuStats({ total, available, unavailable, popular }: MenuStatsProps) {
  const stats = [
    {
      label: '전체 메뉴수',
      value: formatNumber(total),
      icon: UtensilsCrossed,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: '판매중',
      value: formatNumber(available),
      icon: ShoppingCart,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: '품절',
      value: formatNumber(unavailable),
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: '인기메뉴수',
      value: formatNumber(popular),
      icon: Star,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
