'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/constants';
import { usePurchaseOrders } from '@/features/inventory/hooks';
import {
  PurchaseOrderTable,
  PurchaseOrderForm,
} from '@/features/inventory/components';

const STATUS_TABS = [
  { value: 'all', label: '전체' },
  { value: 'draft', label: '초안' },
  { value: 'submitted', label: '제출됨' },
  { value: 'approved', label: '승인됨' },
  { value: 'received', label: '입고완료' },
  { value: 'cancelled', label: '취소됨' },
] as const;

export default function PurchaseOrdersPage() {
  const {
    orders,
    statusFilter,
    setStatusFilter,
    createOrder,
    updateStatus,
    statusCounts,
  } = usePurchaseOrders();

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.inventory}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="발주 관리"
          description="발주서를 작성하고 발주 현황을 관리하세요"
        >
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-1.5" />
            발주서 작성
          </Button>
        </PageHeader>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {statusCounts[tab.value as keyof typeof statusCounts] > 0 && (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                  {statusCounts[tab.value as keyof typeof statusCounts]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          <PurchaseOrderTable
            orders={orders}
            onStatusChange={updateStatus}
          />
        </TabsContent>
      </Tabs>

      <PurchaseOrderForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={createOrder}
      />
    </div>
  );
}
