-- ============================================================
-- Migration: 00010_create_notifications
-- Description: Notifications and announcements
-- ============================================================

-- Announcement priority enum
CREATE TYPE announcement_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- -------------------------------------------------------
-- notifications: 알림
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_brand_id ON notifications (brand_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE notifications IS '알림';

-- -------------------------------------------------------
-- announcements: 공지사항
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  priority announcement_priority NOT NULL DEFAULT 'normal',
  target_role user_role,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_brand_id ON announcements (brand_id);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements (author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements (priority);
CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned ON announcements (is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements (published_at);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE announcements IS '공지사항';
COMMENT ON COLUMN announcements.target_role IS '대상 역할 (NULL이면 전체 대상)';
