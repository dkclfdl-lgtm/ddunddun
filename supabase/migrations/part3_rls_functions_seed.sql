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
