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
