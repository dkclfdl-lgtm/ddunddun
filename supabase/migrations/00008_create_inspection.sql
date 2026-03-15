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
