'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useCustomerAnalytics } from '@/features/customers/hooks';
import { CustomerAnalyticsSection } from '@/features/customers/components/customer-analytics';

export default function CustomersPage() {
  const analytics = useCustomerAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">고객 분석</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            고객 데이터를 분석하고 인사이트를 확인하세요
          </p>
        </div>
        <Link href={ROUTES.customersReviews}>
          <Button>
            <MessageSquare size={16} className="mr-1.5" />
            리뷰 관리
          </Button>
        </Link>
      </div>

      <CustomerAnalyticsSection analytics={analytics} />
    </div>
  );
}
