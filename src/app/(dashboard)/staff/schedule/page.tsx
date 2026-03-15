'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { ScheduleCalendar } from '@/features/staff/components/schedule-calendar';

export default function StaffSchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.staff}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">스케줄 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">주간 근무 스케줄을 관리하세요</p>
        </div>
      </div>

      <ScheduleCalendar />
    </div>
  );
}
