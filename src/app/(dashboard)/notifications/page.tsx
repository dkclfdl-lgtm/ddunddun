'use client';

import { useCallback } from 'react';
import { PageHeader } from '@/components/common';
import { useNotifications, useMarkAsRead } from '@/features/notifications/hooks';
import { NotificationList } from '@/features/notifications/components/notification-list';
import { NotificationFilters } from '@/features/notifications/components/notification-filters';

export default function NotificationsPage() {
  const { notifications, filters, updateTypeFilter, updateReadFilter, refresh } =
    useNotifications();
  const { markRead, markAllRead } = useMarkAsRead();

  const handleRead = useCallback((id: string) => {
    markRead(id);
    refresh();
  }, [markRead, refresh]);

  const handleMarkAllRead = useCallback(() => {
    markAllRead();
    refresh();
  }, [markAllRead, refresh]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="알림 센터"
        description="매출, 재고, 점검, 리뷰 등 주요 알림을 확인하세요"
      />

      <NotificationFilters
        filters={filters}
        onTypeChange={updateTypeFilter}
        onReadChange={updateReadFilter}
        onMarkAllRead={handleMarkAllRead}
      />

      <NotificationList notifications={notifications} onRead={handleRead} />
    </div>
  );
}
