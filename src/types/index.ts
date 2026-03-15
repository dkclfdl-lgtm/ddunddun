export type UserRole = 'admin' | 'supervisor' | 'owner' | 'manager';

export type StoreStatus = 'active' | 'inactive' | 'closed' | 'preparing';

export type InventoryLogType = 'in' | 'out' | 'waste' | 'adjust';

export type ReviewSource = 'naver' | 'google' | 'baemin' | 'yogiyo' | 'coupangeats' | 'direct';

export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed';

export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  brand_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Store {
  id: string;
  brand_id: string;
  name: string;
  address: string;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  status: StoreStatus;
  opening_date: string | null;
  owner_id: string | null;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  brand_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  price: number;
  cost_price: number | null;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SalesDaily {
  id: string;
  store_id: string;
  date: string;
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  created_at: string;
}

export interface SalesHourly {
  id: string;
  store_id: string;
  date: string;
  hour: number;
  revenue: number;
  orders: number;
  created_at: string;
}

export interface SalesByMenu {
  id: string;
  store_id: string;
  menu_item_id: string;
  date: string;
  quantity: number;
  revenue: number;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  store_id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  cost_per_unit: number;
  updated_at: string;
}

export interface InventoryLog {
  id: string;
  inventory_id: string;
  type: InventoryLogType;
  quantity: number;
  note: string | null;
  created_by: string;
  created_at: string;
}

export interface Staff {
  id: string;
  store_id: string;
  name: string;
  position: string;
  phone: string | null;
  hourly_wage: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Schedule {
  id: string;
  staff_id: string;
  store_id: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  staff_id: string;
  store_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  created_at: string;
}

export interface InspectionTemplate {
  id: string;
  brand_id: string;
  name: string;
  items: string[];
  created_at: string;
}

export interface Inspection {
  id: string;
  store_id: string;
  template_id: string;
  inspector_id: string;
  date: string;
  score: number | null;
  status: InspectionStatus;
  notes: string | null;
  created_at: string;
}

export interface InspectionItem {
  id: string;
  inspection_id: string;
  item_name: string;
  is_passed: boolean;
  note: string | null;
  image_url: string | null;
}

export interface Review {
  id: string;
  store_id: string;
  source: ReviewSource;
  rating: number;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  reply: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  brand_id: string;
  title: string;
  content: string;
  author_id: string;
  is_pinned: boolean;
  created_at: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
