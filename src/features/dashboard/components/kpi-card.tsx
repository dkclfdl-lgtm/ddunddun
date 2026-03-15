'use client';

import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  description: string;
}

export function KpiCard({ title, value, change, trend, icon: Icon, description }: KpiCardProps) {
  const isUp = trend === 'up';

  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <div className="flex items-center gap-1.5">
              {isUp ? (
                <TrendingUp size={14} className="text-primary" />
              ) : (
                <TrendingDown size={14} className="text-destructive" />
              )}
              <span className={`text-xs font-medium ${isUp ? 'text-primary' : 'text-destructive'}`}>
                {change}
              </span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </div>
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Icon size={20} className="text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
