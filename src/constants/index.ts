export const APP_NAME = '뚠뚠';
export const APP_NAME_EN = 'DDUNDDUN';
export const APP_DESCRIPTION = '외식 프랜차이즈 운영 지원 대시보드';

export const COLORS = {
  naverGreen: '#03C75A',
  naverGreenHover: '#02B351',
  naverGreenLight: '#E8F9EF',
  secondary: '#1EC800',
  background: '#F5F6F8',
  surface: '#FFFFFF',
  textPrimary: '#1E1E1E',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E5E8EB',
  danger: '#FF4444',
  warning: '#FFAA00',
  success: '#03C75A',
  info: '#1A73E8',
} as const;

export const CHART_COLORS = [
  '#03C75A',
  '#1A73E8',
  '#FF9500',
  '#9B59B6',
  '#E74C6F',
  '#00BCD4',
  '#FF6B6B',
  '#2ECC71',
] as const;

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  dashboardSales: '/dashboard/sales',
  stores: '/stores',
  storeDetail: (id: string) => `/stores/${id}`,
  storeEdit: (id: string) => `/stores/${id}/edit`,
  storeNew: '/stores/new',
  menu: '/menu',
  menuCategories: '/menu/categories',
  menuItems: '/menu/items',
  menuItemNew: '/menu/items/new',
  menuItemDetail: (id: string) => `/menu/items/${id}`,
  menuItemEdit: (id: string) => `/menu/items/${id}/edit`,
  inventory: '/inventory',
  inventoryStore: (id: string) => `/inventory/${id}`,
  inventoryOrders: '/inventory/orders',
  staff: '/staff',
  staffNew: '/staff/new',
  staffDetail: (id: string) => `/staff/${id}`,
  staffSchedule: '/staff/schedule',
  staffAttendance: '/staff/attendance',
  inspection: '/inspection',
  inspectionNew: '/inspection/new',
  inspectionDetail: (id: string) => `/inspection/${id}`,
  inspectionTemplates: '/inspection/templates',
  customers: '/customers',
  customersReviews: '/customers/reviews',
  notifications: '/notifications',
  announcements: '/announcements',
  analytics: '/analytics',
  analyticsUpload: '/analytics/upload',
  settings: '/settings',
  settingsProfile: '/settings/profile',
  settingsBrand: '/settings/brand',
  settingsPermissions: '/settings/permissions',
} as const;

export const STORE_STATUS_MAP = {
  active: { label: '운영중', color: 'bg-green-100 text-green-700' },
  inactive: { label: '휴업', color: 'bg-yellow-100 text-yellow-700' },
  closed: { label: '폐업', color: 'bg-red-100 text-red-700' },
  preparing: { label: '준비중', color: 'bg-blue-100 text-blue-700' },
} as const;

export const USER_ROLE_MAP = {
  admin: { label: '본사 관리자', color: 'bg-purple-100 text-purple-700' },
  supervisor: { label: '슈퍼바이저', color: 'bg-blue-100 text-blue-700' },
  owner: { label: '가맹점주', color: 'bg-green-100 text-green-700' },
  manager: { label: '매장 매니저', color: 'bg-orange-100 text-orange-700' },
} as const;

export const REVIEW_SOURCE_MAP = {
  naver: { label: '네이버', color: 'bg-green-100 text-green-700' },
  google: { label: '구글', color: 'bg-blue-100 text-blue-700' },
  baemin: { label: '배달의민족', color: 'bg-cyan-100 text-cyan-700' },
  yogiyo: { label: '요기요', color: 'bg-red-100 text-red-700' },
  coupangeats: { label: '쿠팡이츠', color: 'bg-orange-100 text-orange-700' },
  direct: { label: '직접 접수', color: 'bg-gray-100 text-gray-700' },
} as const;

export const DATE_FORMAT = {
  full: 'yyyy년 MM월 dd일',
  short: 'yy.MM.dd',
  monthDay: 'MM월 dd일',
  yearMonth: 'yyyy년 MM월',
  time: 'HH:mm',
  dateTime: 'yyyy-MM-dd HH:mm',
  iso: 'yyyy-MM-dd',
} as const;

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;
export const DEFAULT_PAGE_SIZE = 20;
