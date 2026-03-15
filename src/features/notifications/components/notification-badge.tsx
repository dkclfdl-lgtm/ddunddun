'use client';

import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadCount } from '../hooks';

interface NotificationBadgeProps {
  className?: string;
}

export function NotificationBadge({ className }: NotificationBadgeProps) {
  const { count } = useUnreadCount();

  return (
    <div className={cn('relative', className)}>
      <Bell className="h-5 w-5 text-muted-foreground" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF4444] px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
}
