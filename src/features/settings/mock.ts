import type { ProfileSettings, BrandSettings, PermissionRole, AppSettings } from './types';

export const mockProfileSettings: ProfileSettings = {
  name: '김관리',
  email: 'admin@ddunddun.com',
  phone: '010-1234-5678',
  avatarUrl: 'https://picsum.photos/seed/admin/200',
  language: 'ko',
  timezone: 'Asia/Seoul',
};

export const mockBrandSettings: BrandSettings = {
  name: '맛있는 파스타',
  logoUrl: 'https://picsum.photos/seed/brand/200',
  businessNumber: '123-45-67890',
  representative: '김대표',
  phone: '02-1234-5678',
  email: 'contact@tastypasta.com',
  address: '서울시 강남구 테헤란로 123 본사빌딩 5층',
  businessHours: '매일 11:00 - 22:00 (라스트 오더 21:00)',
  description: '신선한 재료로 만드는 정통 이탈리안 파스타 전문 프랜차이즈입니다.',
};

export const mockPermissions: PermissionRole[] = [
  {
    role: 'owner',
    permissions: {
      dashboard: ['view'],
      stores: ['view', 'edit'],
      sales: ['view'],
      menu: ['view'],
      inventory: ['view', 'create', 'edit'],
      staff: ['view', 'create', 'edit', 'delete'],
      inspection: ['view'],
      customers: ['view'],
      notifications: ['view'],
      settings: ['view', 'edit'],
    },
  },
  {
    role: 'manager',
    permissions: {
      dashboard: ['view'],
      stores: ['view'],
      sales: ['view'],
      menu: ['view'],
      inventory: ['view', 'create', 'edit'],
      staff: ['view', 'create', 'edit'],
      inspection: ['view', 'create'],
      customers: ['view'],
      notifications: ['view'],
      settings: ['view'],
    },
  },
  {
    role: 'staff',
    permissions: {
      dashboard: ['view'],
      stores: ['view'],
      sales: ['view'],
      menu: ['view'],
      inventory: ['view'],
      staff: ['view'],
      inspection: ['view'],
      customers: ['view'],
      notifications: ['view'],
      settings: ['view'],
    },
  },
];

export const mockAppSettings: AppSettings = {
  theme: 'light',
  notifications: {
    sales: { email: true, push: true, sms: false },
    inventory: { email: true, push: true, sms: true },
    inspection: { email: true, push: true, sms: false },
    review: { email: false, push: true, sms: false },
    staff: { email: true, push: true, sms: true },
    system: { email: true, push: false, sms: false },
  },
  defaultStore: 'store-1',
};

export const FEATURES_LIST = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'stores', label: '매장 관리' },
  { key: 'sales', label: '매출 분석' },
  { key: 'menu', label: '메뉴 관리' },
  { key: 'inventory', label: '재고 관리' },
  { key: 'staff', label: '직원 관리' },
  { key: 'inspection', label: '매장 점검' },
  { key: 'customers', label: '고객/리뷰' },
  { key: 'notifications', label: '알림' },
  { key: 'settings', label: '설정' },
] as const;

export const ACTIONS_LIST = [
  { key: 'view', label: '조회' },
  { key: 'create', label: '생성' },
  { key: 'edit', label: '수정' },
  { key: 'delete', label: '삭제' },
] as const;

export const ROLE_LABELS: Record<string, string> = {
  owner: '가맹점주',
  manager: '매니저',
  staff: '직원',
};
