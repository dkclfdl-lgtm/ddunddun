'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useInspectionTemplates } from '@/features/inspection/hooks';
import { InspectionTemplateList } from '@/features/inspection/components/inspection-template-list';

export default function InspectionTemplatesPage() {
  const { templates } = useInspectionTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.inspection}>
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">점검 템플릿</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              점검 템플릿을 관리합니다
            </p>
          </div>
        </div>
      </div>

      <InspectionTemplateList templates={templates} />
    </div>
  );
}
