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
