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
