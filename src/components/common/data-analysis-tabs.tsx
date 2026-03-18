'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTabStore, type TabItem } from '@/stores/tab-store';

/**
 * 페이지 경로 → 탭 레이블 매핑
 */
const PAGE_LABEL_MAP: Record<string, string> = {
  '/analytics': '판매현황 통계',
  '/sales-report': '종합보고서 통계',
  '/cost-analysis': '원가 분석',
  '/checklist': '체크리스트',
  '/dashboard': '대시보드',
  '/stores': '매장 관리',
  '/menu': '메뉴 관리',
  '/inventory': '재고 관리',
  '/staff': '직원 관리',
  '/inspection': '매장 점검',
  '/customers': '고객/리뷰',
  '/notifications': '알림',
  '/announcements': '공지사항',
  '/settings': '설정',
  '/dashboard/sales': '매출 분석',
};

function getTabFromPathname(pathname: string): TabItem | null {
  // 정확한 경로 매칭 우선
  if (PAGE_LABEL_MAP[pathname]) {
    return {
      id: pathname,
      href: pathname,
      label: PAGE_LABEL_MAP[pathname],
    };
  }
  // 하위 경로는 상위 경로의 탭으로 매핑
  const parentPath = Object.keys(PAGE_LABEL_MAP).find(
    (path) => pathname.startsWith(path + '/') && path !== '/dashboard',
  );
  if (parentPath) {
    return {
      id: parentPath,
      href: parentPath,
      label: PAGE_LABEL_MAP[parentPath],
    };
  }
  return null;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  tabId: string;
}

export function DataAnalysisTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { tabs, activeTabId, addTab, removeTab, closeAllExceptThis, closeAllTabs, setActiveTab } =
    useTabStore();

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    tabId: '',
  });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // 현재 경로에 해당하는 탭 자동 추가
  useEffect(() => {
    const tab = getTabFromPathname(pathname);
    if (tab) {
      addTab(tab);
    }
  }, [pathname, addTab]);

  // 컨텍스트 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!contextMenu.visible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu.visible]);

  const handleTabClick = useCallback(
    (tab: TabItem) => {
      setActiveTab(tab.id);
      router.push(tab.href);
    },
    [setActiveTab, router],
  );

  const handleCloseTab = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      e.stopPropagation();
      const isClosingActive = activeTabId === tabId;
      const nextHref = removeTab(tabId);
      if (isClosingActive) {
        router.push(nextHref ?? '/dashboard');
      }
    },
    [removeTab, activeTabId, router],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      tabId,
    });
  }, []);

  const handleCloseAllExcept = useCallback(() => {
    closeAllExceptThis(contextMenu.tabId);
    const targetTab = tabs.find((t) => t.id === contextMenu.tabId);
    if (targetTab) {
      router.push(targetTab.href);
    }
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, [closeAllExceptThis, contextMenu.tabId, tabs, router]);

  const handleCloseAll = useCallback(() => {
    closeAllTabs();
    router.push('/dashboard');
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, [closeAllTabs, router]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-0.5 border-b border-border bg-muted/30 px-1 pt-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              className={cn(
                'group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors rounded-t-md border border-b-0 min-w-0 max-w-[200px] shrink-0',
                isActive
                  ? 'bg-background text-foreground border-border -mb-px z-10'
                  : 'bg-transparent text-muted-foreground border-transparent hover:bg-background/50 hover:text-foreground',
              )}
            >
              <span className="truncate">{tab.label}</span>
              <span
                onClick={(e) => handleCloseTab(e, tab.id)}
                className={cn(
                  'ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm transition-colors',
                  isActive
                    ? 'hover:bg-muted'
                    : 'opacity-0 group-hover:opacity-100 hover:bg-muted',
                )}
              >
                <X size={12} />
              </span>
            </button>
          );
        })}
      </div>

      {/* 우클릭 컨텍스트 메뉴 */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed z-[999] min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-md"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={handleCloseAllExcept}
            className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
          >
            이 탭을 제외하고 모두 닫기
          </button>
          <button
            onClick={handleCloseAll}
            className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
          >
            모든 탭 닫기
          </button>
        </div>
      )}
    </>
  );
}
