'use client';

import {
  TrendingUp,
  Package,
  ClipboardCheck,
  Star,
  UserX,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatRelativeDate } from '@/lib/format';
import type { Notification, NotificationType } from '../types';
import { EmptyState } from '@/components/common';

const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { icon: LucideIcon; color: string; bgColor: string }
> = {
  sales_alert: {
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  inventory_alert: {
    icon: Package,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  inspection_due: {
    icon: ClipboardCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  review_new: {
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  staff_absence: {
    icon: UserX,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  system: {
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

interface NotificationListProps {
  notifications: Notification[];
  onRead: (id: string) => void;
}

export function NotificationList({ notifications, onRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        title="알림이 없습니다"
        description="새로운 알림이 도착하면 여기에 표시됩니다."
      />
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => {
        const config = NOTIFICATION_TYPE_CONFIG[notification.type];
        const Icon = config.icon;

        return (
          <Card
            key={notification.id}
            className={cn(
              'cursor-pointer border-border transition-colors hover:bg-muted/50',
              !notification.isRead && 'border-l-4 border-l-[#03C75A] bg-green-50/30'
            )}
            onClick={() => {
              if (!notification.isRead) {
                onRead(notification.id);
              }
            }}
          >
            <CardContent className="flex items-start gap-3 p-4">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  config.bgColor
                )}
              >
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={cn(
                      'text-sm truncate',
                      !notification.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
                    )}
                  >
                    {notification.title}
                  </h4>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeDate(notification.createdAt)}
                  </span>
                </div>
                <p
                  className={cn(
                    'mt-0.5 text-sm',
                    !notification.isRead ? 'text-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  {notification.message}
                </p>
              </div>
              {!notification.isRead && (
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#03C75A]" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
