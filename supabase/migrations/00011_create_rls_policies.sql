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
