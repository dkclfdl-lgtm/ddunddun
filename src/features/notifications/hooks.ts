'use client';

import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NotificationFilters, Notification, Announcement } from './types';
import {
  getNotifications,
  getUnreadCount,
  markAsRead as markAsReadMock,
  markAllAsRead as markAllAsReadMock,
  getAnnouncements,
  createAnnouncement,
} from './mock';
import { announcementFormSchema, type AnnouncementFormValues } from './schema';

export function useNotifications(initialFilters?: Partial<NotificationFilters>) {
  const [filters, setFilters] = useState<NotificationFilters>({
    type: initialFilters?.type ?? 'all',
    isRead: initialFilters?.isRead ?? 'all',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const notifications = useMemo(() => {
    return getNotifications({ type: filters.type, isRead: filters.isRead });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, refreshKey]);

  const updateTypeFilter = useCallback((type: NotificationFilters['type']) => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  const updateReadFilter = useCallback((isRead: NotificationFilters['isRead']) => {
    setFilters((prev) => ({ ...prev, isRead }));
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return {
    notifications,
    filters,
    updateTypeFilter,
    updateReadFilter,
    refresh,
  };
}

export function useUnreadCount() {
  const [refreshKey, setRefreshKey] = useState(0);

  const count = useMemo(() => {
    return getUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return { count, refresh };
}

export function useMarkAsRead() {
  const markRead = useCallback((id: string) => {
    markAsReadMock(id);
  }, []);

  const markAllRead = useCallback(() => {
    markAllAsReadMock();
  }, []);

  return { markRead, markAllRead };
}

export function useAnnouncements() {
  const [refreshKey, setRefreshKey] = useState(0);

  const announcements = useMemo(() => {
    return getAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return { announcements, refresh };
}

export function useAnnouncementForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: '',
      content: '',
      priority: 'normal',
      targetRole: 'all',
      isPinned: false,
    },
  });

  const submitAnnouncement = useCallback(
    async (data: AnnouncementFormValues): Promise<Announcement> => {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const announcement = createAnnouncement({
        title: data.title,
        content: data.content,
        priority: data.priority,
        targetRole: data.targetRole,
        isPinned: data.isPinned,
      });
      setIsSubmitting(false);
      return announcement;
    },
    [],
  );

  return { form, isSubmitting, submitAnnouncement };
}
