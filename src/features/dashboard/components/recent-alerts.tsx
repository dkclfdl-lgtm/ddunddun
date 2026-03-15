'use client';

import { AlertTriangle, Bell, Package, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'danger';
  title: string;
  message: string;
  time: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'danger',
    title: '재고 부족',
    message: '강남점 - 닭가슴살 재고가 최소 수량 이하입니다',
    time: '10분 전',
  },
  {
    id: '2',
    type: 'warning',
    title: '매출 하락',
    message: '이태원점 - 전주 대비 매출이 20% 하락했습니다',
    time: '1시간 전',
  },
  {
    id: '3',
    type: 'info',
    title: '새 리뷰',
    message: '홍대점 - 네이버 신규 리뷰 3건이 등록되었습니다',
    time: '2시간 전',
  },
  {
    id: '4',
    type: 'warning',
    title: '점검 예정',
    message: '명동점 - 내일 위생 점검이 예정되어 있습니다',
    time: '3시간 전',
  },
  {
    id: '5',
    type: 'danger',
    title: '재고 부족',
    message: '신촌점 - 음료 컵 재고가 최소 수량 이하입니다',
    time: '5시간 전',
  },
];

const alertConfig = {
  danger: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  warning: { icon: TrendingDown, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  info: { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
};

export function RecentAlerts() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">최근 알림</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockAlerts.map((alert) => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-secondary/50"
              >
                <div className={cn('mt-0.5 rounded-md p-1.5', config.bg)}>
                  <Icon size={14} className={config.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{alert.message}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{alert.time}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
