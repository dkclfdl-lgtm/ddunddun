'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { StoreForm } from '@/features/stores/components/store-form';

export default function NewStorePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.stores}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">매장 등록</h1>
          <p className="mt-1 text-sm text-muted-foreground">새로운 매장을 등록합니다</p>
        </div>
      </div>
      <StoreForm />
    </div>
  );
}
