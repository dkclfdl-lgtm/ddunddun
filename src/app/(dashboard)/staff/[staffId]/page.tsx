'use client';

import { use } from 'react';
import { StaffDetail } from '@/features/staff/components/staff-detail';

export default function StaffDetailPage({
  params,
}: {
  params: Promise<{ staffId: string }>;
}) {
  const { staffId } = use(params);

  return <StaffDetail staffId={staffId} />;
}
