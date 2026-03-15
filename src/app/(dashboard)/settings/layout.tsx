'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Building2, Shield, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

const SETTINGS_TABS = [
  { href: ROUTES.settingsProfile, label: '프로필', icon: User },
  { href: ROUTES.settingsBrand, label: '브랜드', icon: Building2 },
  { href: ROUTES.settingsPermissions, label: '권한', icon: Shield },
  { href: '/settings/app', label: '앱설정', icon: Settings },
] as const;

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">설정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          시스템 및 계정 설정을 관리하세요
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* 사이드 네비게이션 */}
        <nav className="w-full shrink-0 lg:w-48">
          <div className="flex gap-1 overflow-x-auto lg:flex-col">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#03C75A] text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
