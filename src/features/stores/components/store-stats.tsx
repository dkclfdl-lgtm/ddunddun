'use client';

import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const mockStats = [
  { title: '이번 달 매출', value: '45,200,000원', change: '+15.3%', icon: DollarSign },
  { title: '이번 달 주문', value: '1,240건', change: '+8.7%', icon: ShoppingCart },
  { title: '객단가', value: '36,450원', change: '+5.2%', icon: TrendingUp },
  { title: '직원 수', value: '8명', change: '0', icon: Users },
];

export function StoreStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {mockStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-lg font-bold">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-primary">{stat.change}</p>
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
