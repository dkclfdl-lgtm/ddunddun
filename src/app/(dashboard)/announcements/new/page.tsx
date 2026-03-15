'use client';

import { PageHeader } from '@/components/common';
import { AnnouncementForm } from '@/features/notifications/components/announcement-form';

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="공지사항 작성"
        description="새로운 공지사항을 작성합니다"
      />

      <AnnouncementForm />
    </div>
  );
}
