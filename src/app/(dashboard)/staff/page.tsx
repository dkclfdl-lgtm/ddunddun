'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useStaffList } from '@/features/staff/hooks';
import { StaffTable } from '@/features/staff/components/staff-table';
import { StaffStats } from '@/features/staff/components/staff-stats';
import { StaffFiltersBar } from '@/features/staff/components/staff-filters';
import { LaborCostChart } from '@/features/staff/components/labor-cost-chart';

export default function StaffPage() {
  const { staffList, filters, updateFilter, deleteStaff, stats } = useStaffList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">직원 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            전체 직원을 관리하고 근무 현황을 확인하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.staffSchedule}>
            <Button variant="outline">스케줄 관리</Button>
          </Link>
          <Link href={ROUTES.staffAttendance}>
            <Button variant="outline">출퇴근 관리</Button>
          </Link>
          <Link href={`${ROUTES.staff}/new`}>
            <Button>
              <Plus size={16} className="mr-1.5" />
              직원 등록
            </Button>
          </Link>
        </div>
      </div>

      <StaffStats
        total={stats.total}
        active={stats.active}
        partTime={stats.partTime}
        totalMonthlyCost={stats.totalMonthlyCost}
      />

      <StaffFiltersBar filters={filters} onFilterChange={updateFilter} />

      <StaffTable data={staffList} onDelete={deleteStaff} />

      <LaborCostChart />
    </div>
  );
}
