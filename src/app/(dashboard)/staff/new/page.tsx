'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { StaffForm } from '@/features/staff/components/staff-form';

export default function StaffNewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.staff}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">직원 등록</h1>
          <p className="mt-1 text-sm text-muted-foreground">새로운 직원 정보를 입력해주세요</p>
        </div>
      </div>

      <StaffForm />
    </div>
  );
}
