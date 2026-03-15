-- ============================================
-- DDUNDDUN 전체 마이그레이션 (Supabase SQL Editor에서 실행)
-- ============================================


-- ====== 00001_create_brands.sql ======

-- ============================================================
-- Migration: 00001_create_brands
-- Description: Brands table for F&B franchise operations
-- ============================================================

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  business_number TEXT,
  representative TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands (name);
CREATE INDEX IF NOT EXISTS idx_brands_business_number ON brands (business_number);

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE brands IS '프랜차이즈 브랜드 정보';
COMMENT ON COLUMN brands.name IS '브랜드명';
COMMENT ON COLUMN brands.business_number IS '사업자등록번호';
COMMENT ON COLUMN brands.representative IS '대표자';


-- ====== 00002_create_profiles.sql ======

-- ============================================================
-- Migration: 00002_create_profiles
-- Description: User profiles with role-based access control
-- ============================================================

-- Role enum
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff', 'viewer');

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_brand_id ON profiles (brand_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles (is_active);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE profiles IS '사용자 프로필 (역할 기반 접근 제어)';
COMMENT ON COLUMN profiles.role IS '역할: owner(대표), manager(관리자), staff(직원), viewer(뷰어)';
COMMENT ON COLUMN profiles.is_active IS '활성 상태';


-- ====== 00003_create_stores.sql ======

-- ============================================================
-- Migration: 00003_create_stores
-- Description: Store (매장) management table
-- ============================================================

-- Store status enum
CREATE TYPE store_status AS ENUM ('active', 'inactive', 'pending');

CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  status store_status NOT NULL DEFAULT 'pending',
  address TEXT,
  phone TEXT,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  opening_date DATE,
  monthly_rent NUMERIC(12, 2),
  area_sqm NUMERIC(8, 2),
  seat_count INTEGER,
  operating_hours TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stores_brand_id ON stores (brand_id);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores (status);
CREATE INDEX IF NOT EXISTS idx_stores_manager_id ON stores (manager_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_brand_code ON stores (brand_id, code) WHERE code IS NOT NULL;

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE stores IS '매장 정보';
COMMENT ON COLUMN stores.code IS '매장 코드';
COMMENT ON COLUMN stores.monthly_rent IS '월 임대료';
COMMENT ON COLUMN stores.area_sqm IS '면적 (㎡)';
COMMENT ON COLUMN stores.seat_count IS '좌석 수';
COMMENT ON COLUMN stores.operating_hours IS '영업시간';


-- ====== 00004_create_menu.sql ======

-- ============================================================
-- Migration: 00004_create_menu
-- Description: Menu categories and menu items
-- ============================================================

CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_brand_id ON menu_categories (brand_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_sort_order ON menu_categories (brand_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_categories_brand_code ON menu_categories (brand_id, code) WHERE code IS NOT NULL;

ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  barcode TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(10, 2),
  description TEXT,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items (category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_brand_id ON menu_items (brand_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items (is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_popular ON menu_items (is_popular);
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_items_brand_code ON menu_items (brand_id, code) WHERE code IS NOT NULL;

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE menu_categories IS '메뉴 카테고리';
COMMENT ON TABLE menu_items IS '메뉴 항목';
COMMENT ON COLUMN menu_items.price IS '판매가';
COMMENT ON COLUMN menu_items.cost_price IS '원가';


-- ====== 00005_create_sales.sql ======

-- ============================================================
-- Migration: 00005_create_sales
-- Description: Product categories, product sales (from Excel),
--              daily/hourly/menu sales summaries
-- ============================================================

-- -------------------------------------------------------
-- product_categories: 상품 카테고리 (Excel 기반)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_categories_brand_id ON product_categories (brand_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_categories_brand_code ON product_categories (brand_id, code);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE product_categories IS '상품 카테고리 (주류, 튀김, 음료 등)';

-- -------------------------------------------------------
-- product_sales: 상품별 매출 데이터 (Excel 원본 구조)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_category_code TEXT,
  product_code TEXT,
  product_name TEXT,
  sale_date DATE NOT NULL,

  -- 주문 정보
  order_count INTEGER DEFAULT 0,
  order_items INTEGER DEFAULT 0,
  order_quantity INTEGER DEFAULT 0,
  unit_price NUMERIC(12, 2) DEFAULT 0,
  total_sales_amount NUMERIC(14, 2) DEFAULT 0,

  -- 취소 정보
  cancel_count INTEGER DEFAULT 0,
  cancel_quantity INTEGER DEFAULT 0,
  cancel_amount NUMERIC(14, 2) DEFAULT 0,

  -- 할인 정보
  discount_quantity INTEGER DEFAULT 0,
  discount_amount NUMERIC(14, 2) DEFAULT 0,

  -- 실매출 정보
  actual_sales_quantity INTEGER DEFAULT 0,
  actual_unit_price NUMERIC(12, 2) DEFAULT 0,
  actual_sales_amount NUMERIC(14, 2) DEFAULT 0,

  -- 세금 관련
  supply_price NUMERIC(14, 2) DEFAULT 0,
  vat NUMERIC(14, 2) DEFAULT 0,
  tax_exempt_amount NUMERIC(14, 2) DEFAULT 0,

  -- 최종 매출
  total_discount NUMERIC(14, 2) DEFAULT 0,
  net_sales_amount NUMERIC(14, 2) DEFAULT 0,
  vat_truncation NUMERIC(14, 2) DEFAULT 0,
  final_supply_price NUMERIC(14, 2) DEFAULT 0,
  final_vat NUMERIC(14, 2) DEFAULT 0,

  -- 결제 수단
  payment_amount NUMERIC(14, 2) DEFAULT 0,
  cash_payment NUMERIC(14, 2) DEFAULT 0,
  card_payment NUMERIC(14, 2) DEFAULT 0,
  credit_payment NUMERIC(14, 2) DEFAULT 0,
  coupon_payment NUMERIC(14, 2) DEFAULT 0,
  agency_payment NUMERIC(14, 2) DEFAULT 0,

  -- 환경 부담금
  env_fee_quantity INTEGER DEFAULT 0,
  env_fee_amount NUMERIC(14, 2) DEFAULT 0,

  -- 주문 유형별
  dine_in_orders INTEGER DEFAULT 0,
  dine_in_quantity INTEGER DEFAULT 0,
  dine_in_sales NUMERIC(14, 2) DEFAULT 0,

  takeout_orders INTEGER DEFAULT 0,
  takeout_quantity INTEGER DEFAULT 0,
  takeout_sales NUMERIC(14, 2) DEFAULT 0,

  delivery_orders INTEGER DEFAULT 0,
  delivery_quantity INTEGER DEFAULT 0,
  delivery_sales NUMERIC(14, 2) DEFAULT 0,

  -- 로열티
  royalty_rate NUMERIC(6, 4) DEFAULT 0,
  royalty_amount NUMERIC(14, 2) DEFAULT 0,

  -- 정상/할인/서비스/반품
  normal_sales_qty INTEGER DEFAULT 0,
  normal_unit_price NUMERIC(12, 2) DEFAULT 0,
  normal_sales_amount NUMERIC(14, 2) DEFAULT 0,
  discount_unit_price NUMERIC(12, 2) DEFAULT 0,
  service_quantity INTEGER DEFAULT 0,
  service_amount NUMERIC(14, 2) DEFAULT 0,
  return_quantity INTEGER DEFAULT 0,
  return_amount NUMERIC(14, 2) DEFAULT 0,

  -- 회원 관련
  member_orders INTEGER DEFAULT 0,
  member_order_count INTEGER DEFAULT 0,
  member_sales_amount NUMERIC(14, 2) DEFAULT 0,

  -- 객단가
  customer_average NUMERIC(12, 2) DEFAULT 0,
  first_customer_avg NUMERIC(12, 2) DEFAULT 0,
  second_customer_avg NUMERIC(12, 2) DEFAULT 0,

  -- 세트/코스/포인트
  set_quantity INTEGER DEFAULT 0,
  set_amount NUMERIC(14, 2) DEFAULT 0,
  course_quantity INTEGER DEFAULT 0,
  course_amount NUMERIC(14, 2) DEFAULT 0,
  point_amount NUMERIC(14, 2) DEFAULT 0,
  point_quantity INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_sales_brand_id ON product_sales (brand_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_store_id ON product_sales (store_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_sale_date ON product_sales (sale_date);
CREATE INDEX IF NOT EXISTS idx_product_sales_category_code ON product_sales (product_category_code);
CREATE INDEX IF NOT EXISTS idx_product_sales_store_date ON product_sales (store_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_product_sales_brand_store_date ON product_sales (brand_id, store_id, sale_date);

ALTER TABLE product_sales ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE product_sales IS '상품별 매출 데이터 (POS 엑셀 원본 기반)';

-- -------------------------------------------------------
-- sales_daily: 일별 매출 요약
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_revenue NUMERIC(14, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  avg_order_value NUMERIC(12, 2) DEFAULT 0,
  cash_sales NUMERIC(14, 2) DEFAULT 0,
  card_sales NUMERIC(14, 2) DEFAULT 0,
  dine_in_sales NUMERIC(14, 2) DEFAULT 0,
  takeout_sales NUMERIC(14, 2) DEFAULT 0,
  delivery_sales NUMERIC(14, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_daily_store_date ON sales_daily (store_id, date);
CREATE INDEX IF NOT EXISTS idx_sales_daily_brand_date ON sales_daily (brand_id, date);

ALTER TABLE sales_daily ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE sales_daily IS '일별 매출 요약';

-- -------------------------------------------------------
-- sales_hourly: 시간대별 매출
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_hourly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  revenue NUMERIC(14, 2) DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_hourly_store_date_hour ON sales_hourly (store_id, date, hour);
CREATE INDEX IF NOT EXISTS idx_sales_hourly_brand_date ON sales_hourly (brand_id, date);

ALTER TABLE sales_hourly ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE sales_hourly IS '시간대별 매출';

-- -------------------------------------------------------
-- sales_by_menu: 메뉴별 매출
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_by_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity_sold INTEGER DEFAULT 0,
  revenue NUMERIC(14, 2) DEFAULT 0,
  discount_amount NUMERIC(14, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_by_menu_store_date ON sales_by_menu (store_id, date);
CREATE INDEX IF NOT EXISTS idx_sales_by_menu_menu_item ON sales_by_menu (menu_item_id);
CREATE INDEX IF NOT EXISTS idx_sales_by_menu_brand_date ON sales_by_menu (brand_id, date);

ALTER TABLE sales_by_menu ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE sales_by_menu IS '메뉴별 매출';


-- ====== 00006_create_inventory.sql ======

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


-- ====== 00007_create_staff.sql ======

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


-- ====== 00008_create_inspection.sql ======

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


-- ====== 00009_create_reviews.sql ======

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


-- ====== 00010_create_notifications.sql ======

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


-- ====== 00011_create_rls_policies.sql ======

-- ============================================================
-- Migration: 00011_create_rls_policies
-- Description: Row Level Security policies for brand-level
--              data isolation across all tables
-- ============================================================

-- Helper function: get current user's brand_id
CREATE OR REPLACE FUNCTION get_user_brand_id()
RETURNS UUID AS $$
  SELECT brand_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- BRANDS policies
-- ============================================================
CREATE POLICY "Users can view their own brand"
  ON brands FOR SELECT
  USING (id = get_user_brand_id());

CREATE POLICY "Owners can update their brand"
  ON brands FOR UPDATE
  USING (id = get_user_brand_id() AND get_user_role() = 'owner');

-- ============================================================
-- PROFILES policies
-- ============================================================
CREATE POLICY "Users can view profiles in their brand"
  ON profiles FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Owners can insert profiles in their brand"
  ON profiles FOR INSERT
  WITH CHECK (brand_id = get_user_brand_id() AND get_user_role() = 'owner');

CREATE POLICY "Owners can delete profiles in their brand"
  ON profiles FOR DELETE
  USING (brand_id = get_user_brand_id() AND get_user_role() = 'owner');

-- ============================================================
-- STORES policies
-- ============================================================
CREATE POLICY "Users can view stores in their brand"
  ON stores FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can insert stores"
  ON stores FOR INSERT
  WITH CHECK (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

CREATE POLICY "Owners and managers can update stores"
  ON stores FOR UPDATE
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

CREATE POLICY "Owners can delete stores"
  ON stores FOR DELETE
  USING (brand_id = get_user_brand_id() AND get_user_role() = 'owner');

-- ============================================================
-- MENU_CATEGORIES policies
-- ============================================================
CREATE POLICY "Users can view menu categories in their brand"
  ON menu_categories FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can manage menu categories"
  ON menu_categories FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

-- ============================================================
-- MENU_ITEMS policies
-- ============================================================
CREATE POLICY "Users can view menu items in their brand"
  ON menu_items FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can manage menu items"
  ON menu_items FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

-- ============================================================
-- PRODUCT_CATEGORIES policies
-- ============================================================
CREATE POLICY "Users can view product categories in their brand"
  ON product_categories FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can manage product categories"
  ON product_categories FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

-- ============================================================
-- PRODUCT_SALES policies
-- ============================================================
CREATE POLICY "Users can view product sales in their brand"
  ON product_sales FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can manage product sales"
  ON product_sales FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

-- ============================================================
-- SALES_DAILY policies
-- ============================================================
CREATE POLICY "Users can view daily sales in their brand"
  ON sales_daily FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can manage daily sales"
  ON sales_daily FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

-- ============================================================
-- SALES_HOURLY policies
-- ============================================================
CREATE POLICY "Users can view hourly sales in their brand"
  ON sales_hourly FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can manage hourly sales"
  ON sales_hourly FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

-- ============================================================
-- SALES_BY_MENU policies
-- ============================================================
CREATE POLICY "Users can view menu sales in their brand"
  ON sales_by_menu FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can manage menu sales"
  ON sales_by_menu FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

-- ============================================================
-- INVENTORY policies
-- ============================================================
CREATE POLICY "Users can view inventory in their brand"
  ON inventory FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can manage inventory"
  ON inventory FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

-- ============================================================
-- INVENTORY_LOGS policies
-- ============================================================
CREATE POLICY "Users can view inventory logs in their brand"
  ON inventory_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inventory i
      WHERE i.id = inventory_logs.inventory_id
        AND i.brand_id = get_user_brand_id()
    )
  );

CREATE POLICY "Owners managers and staff can insert inventory logs"
  ON inventory_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inventory i
      WHERE i.id = inventory_logs.inventory_id
        AND i.brand_id = get_user_brand_id()
    )
    AND get_user_role() IN ('owner', 'manager', 'staff')
  );

-- ============================================================
-- STAFF policies
-- ============================================================
CREATE POLICY "Users can view staff in their brand"
  ON staff FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can manage staff"
  ON staff FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

-- ============================================================
-- SCHEDULES policies
-- ============================================================
CREATE POLICY "Users can view schedules in their brand"
  ON schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = schedules.staff_id
        AND s.brand_id = get_user_brand_id()
    )
  );

CREATE POLICY "Owners and managers can manage schedules"
  ON schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = schedules.staff_id
        AND s.brand_id = get_user_brand_id()
    )
    AND get_user_role() IN ('owner', 'manager')
  );

-- ============================================================
-- ATTENDANCE policies
-- ============================================================
CREATE POLICY "Users can view attendance in their brand"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = attendance.staff_id
        AND s.brand_id = get_user_brand_id()
    )
  );

CREATE POLICY "Owners and managers can manage attendance"
  ON attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = attendance.staff_id
        AND s.brand_id = get_user_brand_id()
    )
    AND get_user_role() IN ('owner', 'manager')
  );

-- ============================================================
-- INSPECTION_TEMPLATES policies
-- ============================================================
CREATE POLICY "Users can view inspection templates in their brand"
  ON inspection_templates FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can manage inspection templates"
  ON inspection_templates FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

-- ============================================================
-- INSPECTIONS policies
-- ============================================================
CREATE POLICY "Users can view inspections in their brand"
  ON inspections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = inspections.store_id
        AND s.brand_id = get_user_brand_id()
    )
  );

CREATE POLICY "Owners and managers can manage inspections"
  ON inspections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = inspections.store_id
        AND s.brand_id = get_user_brand_id()
    )
    AND get_user_role() IN ('owner', 'manager')
  );

-- ============================================================
-- INSPECTION_ITEMS policies
-- ============================================================
CREATE POLICY "Users can view inspection items in their brand"
  ON inspection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      JOIN stores s ON s.id = i.store_id
      WHERE i.id = inspection_items.inspection_id
        AND s.brand_id = get_user_brand_id()
    )
  );

CREATE POLICY "Owners and managers can manage inspection items"
  ON inspection_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM inspections i
      JOIN stores s ON s.id = i.store_id
      WHERE i.id = inspection_items.inspection_id
        AND s.brand_id = get_user_brand_id()
    )
    AND get_user_role() IN ('owner', 'manager')
  );

-- ============================================================
-- REVIEWS policies
-- ============================================================
CREATE POLICY "Users can view reviews in their brand"
  ON reviews FOR SELECT
  USING (brand_id = get_user_brand_id());

CREATE POLICY "Owners and managers can manage reviews"
  ON reviews FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));

-- ============================================================
-- NOTIFICATIONS policies
-- ============================================================
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (brand_id = get_user_brand_id());

-- ============================================================
-- ANNOUNCEMENTS policies
-- ============================================================
CREATE POLICY "Users can view announcements in their brand"
  ON announcements FOR SELECT
  USING (
    brand_id = get_user_brand_id()
    AND (target_role IS NULL OR target_role = get_user_role())
  );

CREATE POLICY "Owners and managers can manage announcements"
  ON announcements FOR ALL
  USING (brand_id = get_user_brand_id() AND get_user_role() IN ('owner', 'manager'));


-- ====== 00012_create_functions.sql ======

-- ============================================================
-- Migration: 00012_create_functions
-- Description: Helper functions and triggers
-- ============================================================

-- -------------------------------------------------------
-- Trigger function: auto-update updated_at column
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'brands', 'profiles', 'stores',
      'menu_categories', 'menu_items',
      'product_sales', 'sales_daily', 'sales_hourly', 'sales_by_menu',
      'inventory',
      'staff', 'schedules', 'attendance',
      'inspection_templates', 'inspections'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW
         EXECUTE FUNCTION update_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- -------------------------------------------------------
-- Function: calculate daily sales summary from product_sales
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_daily_summary(
  p_brand_id UUID,
  p_store_id UUID,
  p_date DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO sales_daily (
    brand_id, store_id, date,
    total_revenue, total_orders, avg_order_value,
    cash_sales, card_sales,
    dine_in_sales, takeout_sales, delivery_sales
  )
  SELECT
    p_brand_id,
    p_store_id,
    p_date,
    COALESCE(SUM(actual_sales_amount), 0),
    COALESCE(SUM(order_count), 0),
    CASE
      WHEN COALESCE(SUM(order_count), 0) > 0
        THEN COALESCE(SUM(actual_sales_amount), 0) / SUM(order_count)
      ELSE 0
    END,
    COALESCE(SUM(cash_payment), 0),
    COALESCE(SUM(card_payment), 0),
    COALESCE(SUM(dine_in_sales), 0),
    COALESCE(SUM(takeout_sales), 0),
    COALESCE(SUM(delivery_sales), 0)
  FROM product_sales
  WHERE brand_id = p_brand_id
    AND store_id = p_store_id
    AND sale_date = p_date
  ON CONFLICT (store_id, date)
  DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    total_orders = EXCLUDED.total_orders,
    avg_order_value = EXCLUDED.avg_order_value,
    cash_sales = EXCLUDED.cash_sales,
    card_sales = EXCLUDED.card_sales,
    dine_in_sales = EXCLUDED.dine_in_sales,
    takeout_sales = EXCLUDED.takeout_sales,
    delivery_sales = EXCLUDED.delivery_sales,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------
-- Function: recalculate daily summaries for a date range
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION recalculate_daily_summaries(
  p_brand_id UUID,
  p_store_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_date DATE;
  v_count INTEGER := 0;
BEGIN
  FOR v_date IN
    SELECT generate_series(p_start_date, p_end_date, '1 day'::INTERVAL)::DATE
  LOOP
    PERFORM calculate_daily_summary(p_brand_id, p_store_id, v_date);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------
-- Function: get sales summary stats for dashboard
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION get_sales_summary(
  p_brand_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_store_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_orders INTEGER,
  avg_order_value NUMERIC,
  total_cash NUMERIC,
  total_card NUMERIC,
  total_dine_in NUMERIC,
  total_takeout NUMERIC,
  total_delivery NUMERIC,
  day_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(sd.total_revenue), 0)::NUMERIC,
    COALESCE(SUM(sd.total_orders), 0)::INTEGER,
    CASE
      WHEN COALESCE(SUM(sd.total_orders), 0) > 0
        THEN (COALESCE(SUM(sd.total_revenue), 0) / SUM(sd.total_orders))::NUMERIC
      ELSE 0::NUMERIC
    END,
    COALESCE(SUM(sd.cash_sales), 0)::NUMERIC,
    COALESCE(SUM(sd.card_sales), 0)::NUMERIC,
    COALESCE(SUM(sd.dine_in_sales), 0)::NUMERIC,
    COALESCE(SUM(sd.takeout_sales), 0)::NUMERIC,
    COALESCE(SUM(sd.delivery_sales), 0)::NUMERIC,
    COUNT(DISTINCT sd.date)::INTEGER
  FROM sales_daily sd
  WHERE sd.brand_id = p_brand_id
    AND sd.date BETWEEN p_start_date AND p_end_date
    AND (p_store_id IS NULL OR sd.store_id = p_store_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- -------------------------------------------------------
-- Function: get top selling products for a period
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION get_top_products(
  p_brand_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_store_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  product_name TEXT,
  product_category_code TEXT,
  total_quantity INTEGER,
  total_amount NUMERIC,
  total_orders INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.product_name,
    ps.product_category_code,
    COALESCE(SUM(ps.actual_sales_quantity), 0)::INTEGER,
    COALESCE(SUM(ps.actual_sales_amount), 0)::NUMERIC,
    COALESCE(SUM(ps.order_count), 0)::INTEGER
  FROM product_sales ps
  WHERE ps.brand_id = p_brand_id
    AND ps.sale_date BETWEEN p_start_date AND p_end_date
    AND (p_store_id IS NULL OR ps.store_id = p_store_id)
  GROUP BY ps.product_name, ps.product_category_code
  ORDER BY SUM(ps.actual_sales_amount) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ====== 00013_seed_data.sql ======

-- ============================================================
-- Migration: 00013_seed_data
-- Description: Seed data for sample brand and product categories
-- ============================================================

-- -------------------------------------------------------
-- Sample brand
-- -------------------------------------------------------
INSERT INTO brands (id, name, business_number, representative, phone, email, address)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '뚠뚠 프랜차이즈',
  '123-45-67890',
  '김대표',
  '02-1234-5678',
  'info@ddunddun.kr',
  '서울특별시 강남구 테헤란로 123'
)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- Product categories (20 categories from Excel data)
-- -------------------------------------------------------
INSERT INTO product_categories (brand_id, code, name, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'C001', '튀김', 1),
  ('00000000-0000-0000-0000-000000000001', 'C002', '마른안주', 2),
  ('00000000-0000-0000-0000-000000000001', 'C003', '탕', 3),
  ('00000000-0000-0000-0000-000000000001', 'C004', '특별메뉴', 4),
  ('00000000-0000-0000-0000-000000000001', 'C005', '주류', 5),
  ('00000000-0000-0000-0000-000000000001', 'C006', '음료', 6),
  ('00000000-0000-0000-0000-000000000001', 'C007', '칵테일', 7),
  ('00000000-0000-0000-0000-000000000001', 'C008', '서비스', 8),
  ('00000000-0000-0000-0000-000000000001', 'C009', '직원호출', 9),
  ('00000000-0000-0000-0000-000000000001', 'C010', '추가메뉴', 10),
  ('00000000-0000-0000-0000-000000000001', 'C016', '보드카', 11),
  ('00000000-0000-0000-0000-000000000001', 'C020', '전', 12),
  ('00000000-0000-0000-0000-000000000001', 'C021', '치킨', 13),
  ('00000000-0000-0000-0000-000000000001', 'C022', '떡볶이', 14),
  ('00000000-0000-0000-0000-000000000001', 'C023', '과일', 15),
  ('00000000-0000-0000-0000-000000000001', 'C026', '사이드메뉴', 16),
  ('00000000-0000-0000-0000-000000000001', 'C027', '양주', 17),
  ('00000000-0000-0000-0000-000000000001', 'C030', '찜', 18),
  ('00000000-0000-0000-0000-000000000001', 'C042', '바틀', 19),
  ('00000000-0000-0000-0000-000000000001', 'C057', '막걸리', 20)
ON CONFLICT (brand_id, code) DO NOTHING;

-- -------------------------------------------------------
-- Sample stores
-- -------------------------------------------------------
INSERT INTO stores (id, brand_id, name, code, status, address, phone, opening_date, seat_count, operating_hours)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    '강남점',
    'S001',
    'active',
    '서울특별시 강남구 역삼동 123-45',
    '02-555-0001',
    '2024-01-15',
    60,
    '17:00 - 02:00'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    '홍대점',
    'S002',
    'active',
    '서울특별시 마포구 서교동 456-78',
    '02-555-0002',
    '2024-03-01',
    45,
    '17:00 - 03:00'
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000001',
    '신촌점',
    'S003',
    'active',
    '서울특별시 서대문구 신촌동 789-12',
    '02-555-0003',
    '2024-06-01',
    50,
    '17:00 - 02:00'
  )
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- Sample menu categories (matching product categories)
-- -------------------------------------------------------
INSERT INTO menu_categories (id, brand_id, name, code, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '튀김', 'C001', 1, true),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', '마른안주', 'C002', 2, true),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', '탕', 'C003', 3, true),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', '특별메뉴', 'C004', 4, true),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001', '주류', 'C005', 5, true),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000001', '음료', 'C006', 6, true),
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000001', '치킨', 'C021', 7, true)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- Sample inspection template
-- -------------------------------------------------------
INSERT INTO inspection_templates (id, brand_id, name, description, category, items, max_score, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000001',
  '위생 점검',
  '매장 위생 상태 정기 점검',
  '위생',
  '[
    {"name": "주방 청결", "max_score": 10, "category": "주방"},
    {"name": "식재료 보관", "max_score": 10, "category": "주방"},
    {"name": "냉장고 온도", "max_score": 10, "category": "주방"},
    {"name": "홀 청결", "max_score": 10, "category": "홀"},
    {"name": "화장실 청결", "max_score": 10, "category": "시설"},
    {"name": "직원 위생복", "max_score": 10, "category": "직원"},
    {"name": "해충 관리", "max_score": 10, "category": "시설"},
    {"name": "쓰레기 관리", "max_score": 10, "category": "시설"},
    {"name": "소독 기록", "max_score": 10, "category": "관리"},
    {"name": "유통기한 관리", "max_score": 10, "category": "관리"}
  ]'::JSONB,
  100,
  true
)
ON CONFLICT (id) DO NOTHING;

