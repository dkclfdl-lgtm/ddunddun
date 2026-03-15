export type NotificationType =
  | 'sales_alert'
  | 'inventory_alert'
  | 'inspection_due'
  | 'review_new'
  | 'staff_absence'
  | 'system';

export interface Notification {
  id: string;
  brandId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data: Record<string, unknown>;
  createdAt: string;
}

export type AnnouncementPriority = 'high' | 'normal' | 'low';

export type AnnouncementTargetRole = 'all' | 'owner' | 'manager' | 'staff';

export interface Announcement {
  id: string;
  brandId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targetRole: AnnouncementTargetRole;
  isPinned: boolean;
  publishedAt: string;
  createdAt: string;
}

export interface NotificationFilters {
  type: NotificationType | 'all';
  isRead: 'all' | 'read' | 'unread';
}
