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
