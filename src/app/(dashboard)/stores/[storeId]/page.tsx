'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useStoreDetail } from '@/features/stores/hooks';
import { StoreDetailInfo } from '@/features/stores/components/store-detail-info';
import { StoreStats } from '@/features/stores/components/store-stats';

export default function StoreDetailPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);
  const { store, isLoading } = useStoreDetail(storeId);

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground">로딩 중...</div>;
  }

  if (!store) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">매장을 찾을 수 없습니다</p>
        <Link href={ROUTES.stores}>
          <Button variant="outline">매장 목록으로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.stores}>
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{store.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{store.address}</p>
          </div>
        </div>
        <Link href={ROUTES.storeEdit(storeId)}>
          <Button variant="outline">
            <Pencil size={16} className="mr-1.5" />
            수정
          </Button>
        </Link>
      </div>

      <StoreStats />
      <StoreDetailInfo store={store} />
    </div>
  );
}
