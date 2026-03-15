'use client';

import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useMenuItemDetail } from '@/features/menu/hooks';
import { MenuItemDetail } from '@/features/menu/components/menu-item-detail';

export default function MenuItemDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = use(params);
  const { item, isLoading, averageDailyRevenue } = useMenuItemDetail(itemId);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">메뉴를 찾을 수 없습니다</p>
        <Link href={ROUTES.menu}>
          <Button variant="outline">메뉴 목록으로</Button>
        </Link>
      </div>
    );
  }

  return <MenuItemDetail item={item} averageDailyRevenue={averageDailyRevenue} />;
}
