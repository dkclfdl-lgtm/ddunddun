'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useInspectionList } from '@/features/inspection/hooks';
import { InspectionTable } from '@/features/inspection/components/inspection-table';
import { InspectionStats } from '@/features/inspection/components/inspection-stats';
import { InspectionFiltersBar } from '@/features/inspection/components/inspection-filters';
import { InspectionComparisonChart } from '@/features/inspection/components/inspection-comparison-chart';

export default function InspectionPage() {
  const { inspections, filters, updateFilters } = useInspectionList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">매장 점검</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            매장 점검 현황을 확인하고 새로운 점검을 실시하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.inspectionTemplates}>
            <Button variant="outline">템플릿 관리</Button>
          </Link>
          <Link href={ROUTES.inspectionNew}>
            <Button>
              <Plus size={16} className="mr-1.5" />
              새 점검
            </Button>
          </Link>
        </div>
      </div>

      <InspectionStats />

      <InspectionComparisonChart />

      <InspectionFiltersBar filters={filters} onFiltersChange={updateFilters} />

      <InspectionTable inspections={inspections} />
    </div>
  );
}
