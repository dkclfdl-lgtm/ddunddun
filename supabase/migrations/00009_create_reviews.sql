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
