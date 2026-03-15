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
