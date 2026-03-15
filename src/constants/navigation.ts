import {
  LayoutDashboard,
  Store,
  BarChart3,
  UtensilsCrossed,
  Package,
  Users,
  ClipboardCheck,
  MessageSquare,
  Bell,
  Megaphone,
  Settings,
  FileSpreadsheet,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from './index';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAVIGATION: NavSection[] = [
  {
    title: '개요',
    items: [
      {
        title: '대시보드',
        href: ROUTES.dashboard,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: '매장 운영',
    items: [
      {
        title: '매장 관리',
        href: ROUTES.stores,
        icon: Store,
      },
      {
        title: '매출 분석',
        href: ROUTES.dashboardSales,
        icon: BarChart3,
      },
      {
        title: '메뉴 관리',
        href: ROUTES.menu,
        icon: UtensilsCrossed,
      },
      {
        title: '재고 관리',
        href: ROUTES.inventory,
        icon: Package,
      },
    ],
  },
  {
    title: '인력 & 점검',
    items: [
      {
        title: '직원 관리',
        href: ROUTES.staff,
        icon: Users,
      },
      {
        title: '매장 점검',
        href: ROUTES.inspection,
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: '고객 & 소통',
    items: [
      {
        title: '고객/리뷰',
        href: ROUTES.customers,
        icon: MessageSquare,
      },
      {
        title: '알림',
        href: ROUTES.notifications,
        icon: Bell,
      },
      {
        title: '공지사항',
        href: ROUTES.announcements,
        icon: Megaphone,
      },
    ],
  },
  {
    title: '데이터 분석',
    items: [
      {
        title: 'Excel 통계',
        href: ROUTES.analytics,
        icon: FileSpreadsheet,
      },
    ],
  },
  {
    title: '시스템',
    items: [
      {
        title: '설정',
        href: ROUTES.settings,
        icon: Settings,
      },
    ],
  },
];
