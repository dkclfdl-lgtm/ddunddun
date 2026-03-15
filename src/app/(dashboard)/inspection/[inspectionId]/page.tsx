'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useInspectionDetail } from '@/features/inspection/hooks';
import { InspectionDetailView } from '@/features/inspection/components/inspection-detail';

export default function InspectionDetailPage({
  params,
}: {
  params: Promise<{ inspectionId: string }>;
}) {
  const { inspectionId } = use(params);
  const { inspection, items, isLoading } = useInspectionDetail(inspectionId);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">점검 기록을 찾을 수 없습니다</p>
        <Link href={ROUTES.inspection}>
          <Button variant="outline">점검 목록으로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.inspection}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {inspection.storeName} - {inspection.templateName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            점검 상세 결과를 확인합니다
          </p>
        </div>
      </div>

      <InspectionDetailView inspection={inspection} items={items} />
    </div>
  );
}
