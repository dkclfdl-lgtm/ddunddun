'use client';

import { Users, UserCheck, Clock, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/format';

interface StaffStatsProps {
  total: number;
  active: number;
  partTime: number;
  totalMonthlyCost: number;
}

export function StaffStats({ total, active, partTime, totalMonthlyCost }: StaffStatsProps) {
  const items = [
    {
      label: '전체 직원',
      value: formatNumber(total),
      suffix: '명',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: '재직중',
      value: formatNumber(active),
      suffix: '명',
      icon: UserCheck,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: '파트타임',
      value: formatNumber(partTime),
      suffix: '명',
      icon: Clock,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      label: '이번달 인건비',
      value: formatCurrency(totalMonthlyCost),
      suffix: '',
      icon: Wallet,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-xl font-bold">
                {item.value}
                {item.suffix && <span className="text-sm font-normal text-muted-foreground ml-0.5">{item.suffix}</span>}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
