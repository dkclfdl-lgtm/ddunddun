'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { AttendanceTable } from '@/features/staff/components/attendance-table';

export default function StaffAttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.staff}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">출퇴근 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">월간 출퇴근 현황을 확인하세요</p>
        </div>
      </div>

      <AttendanceTable />
    </div>
  );
}
