-- ============================================================
-- Migration: 00006_create_inventory
-- Description: Inventory management and stock logs
-- ============================================================

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT,
  unit TEXT,
  current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
  min_stock NUMERIC(10, 2) DEFAULT 0,
  max_stock NUMERIC(10, 2),
  unit_cost NUMERIC(10, 2) DEFAULT 0,
  supplier TEXT,
  last_ordered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_brand_id ON inventory (brand_id);
CREATE INDEX IF NOT EXISTS idx_inventory_store_id ON inventory (store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory (category);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory (store_id) WHERE current_stock <= min_stock;

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE inventory IS '재고 관리';
COMMENT ON COLUMN inventory.unit IS '단위 (kg, ea, L 등)';
COMMENT ON COLUMN inventory.min_stock IS '최소 재고량 (발주점)';
COMMENT ON COLUMN inventory.max_stock IS '최대 재고량';

-- Inventory change type
CREATE TYPE inventory_log_type AS ENUM ('in', 'out', 'adjust');

CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  type inventory_log_type NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  memo TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_inventory_id ON inventory_logs (inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_type ON inventory_logs (type);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs (created_at);

ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE inventory_logs IS '재고 변동 이력';
COMMENT ON COLUMN inventory_logs.type IS '변동 유형: in(입고), out(출고), adjust(조정)';
-- ============================================================
-- Migration: 00007_create_staff
-- Description: Staff, schedules, and attendance management
-- ============================================================

-- Staff status enum
CREATE TYPE staff_status AS ENUM ('active', 'inactive', 'on_leave');

-- Attendance status enum
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'early_leave', 'holiday');

-- -------------------------------------------------------
-- staff: 직원 정보
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  hire_date DATE,
  hourly_wage NUMERIC(10, 2),
  status staff_status NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_brand_id ON staff (brand_id);
CREATE INDEX IF NOT EXISTS idx_staff_store_id ON staff (store_id);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff (status);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE staff IS '직원 정보';
COMMENT ON COLUMN staff.hourly_wage IS '시급';

-- -------------------------------------------------------
-- schedules: 근무 일정
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER DEFAULT 0,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_staff_id ON schedules (staff_id);
CREATE INDEX IF NOT EXISTS idx_schedules_store_id ON schedules (store_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules (date);
CREATE INDEX IF NOT EXISTS idx_schedules_store_date ON schedules (store_id, date);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE schedules IS '근무 일정';
COMMENT ON COLUMN schedules.break_minutes IS '휴식 시간 (분)';

-- -------------------------------------------------------
-- attendance: 출퇴근 기록
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status attendance_status NOT NULL DEFAULT 'present',
  overtime_hours NUMERIC(4, 2) DEFAULT 0,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_staff_id ON attendance (staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_store_id ON attendance (store_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance (date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_staff_date ON attendance (staff_id, date);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE attendance IS '출퇴근 기록';
COMMENT ON COLUMN attendance.overtime_hours IS '초과근무 시간';
-- ============================================================
-- Migration: 00008_create_inspection
-- Description: Inspection templates, inspections, and items
-- ============================================================

-- Inspection status enum
CREATE TYPE inspection_status AS ENUM ('draft', 'in_progress', 'completed', 'cancelled');

-- -------------------------------------------------------
-- inspection_templates: 점검 템플릿
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  max_score INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspection_templates_brand_id ON inspection_templates (brand_id);
CREATE INDEX IF NOT EXISTS idx_inspection_templates_category ON inspection_templates (category);
CREATE INDEX IF NOT EXISTS idx_inspection_templates_is_active ON inspection_templates (is_active);

ALTER TABLE inspection_templates ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE inspection_templates IS '점검 템플릿';
COMMENT ON COLUMN inspection_templates.items IS '점검 항목 목록 (JSON 배열)';

-- -------------------------------------------------------
-- inspections: 점검 기록
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES inspection_templates(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  inspection_date DATE NOT NULL,
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  status inspection_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspections_template_id ON inspections (template_id);
CREATE INDEX IF NOT EXISTS idx_inspections_store_id ON inspections (store_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON inspections (inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections (inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections (status);

ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE inspections IS '점검 기록';

-- -------------------------------------------------------
-- inspection_items: 점검 항목별 결과
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 10,
  notes TEXT,
  image_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspection_items_inspection_id ON inspection_items (inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_category ON inspection_items (category);

ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE inspection_items IS '점검 항목별 결과';
COMMENT ON COLUMN inspection_items.image_urls IS '점검 사진 URL 목록';
-- ============================================================
-- Migration: 00009_create_reviews
-- Description: Customer reviews from various platforms
-- ============================================================

-- Sentiment enum
CREATE TYPE review_sentiment AS ENUM ('positive', 'neutral', 'negative');

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  platform TEXT,
  author TEXT,
  rating NUMERIC(2, 1),
  content TEXT,
  reply TEXT,
  sentiment review_sentiment,
  replied_at TIMESTAMPTZ,
  review_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_brand_id ON reviews (brand_id);
CREATE INDEX IF NOT EXISTS idx_reviews_store_id ON reviews (store_id);
CREATE INDEX IF NOT EXISTS idx_reviews_platform ON reviews (platform);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews (rating);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews (sentiment);
CREATE INDEX IF NOT EXISTS idx_reviews_review_date ON reviews (review_date);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE reviews IS '고객 리뷰';
COMMENT ON COLUMN reviews.platform IS '리뷰 플랫폼 (네이버, 카카오, 배달의민족 등)';
COMMENT ON COLUMN reviews.sentiment IS '감성 분석 결과';
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
