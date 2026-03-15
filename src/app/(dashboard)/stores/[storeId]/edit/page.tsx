'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { StoreForm } from '@/features/stores/components/store-form';

export default function EditStorePage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.storeDetail(storeId)}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">매장 수정</h1>
          <p className="mt-1 text-sm text-muted-foreground">매장 정보를 수정합니다</p>
        </div>
      </div>
      <StoreForm storeId={storeId} />
    </div>
  );
}
