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
