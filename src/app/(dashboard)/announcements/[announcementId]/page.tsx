'use client';

import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { getAnnouncementById } from '@/features/notifications/mock';
import { AnnouncementDetail } from '@/features/notifications/components/announcement-detail';

export default function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ announcementId: string }>;
}) {
  const { announcementId } = use(params);
  const announcement = getAnnouncementById(announcementId);

  if (!announcement) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">공지사항을 찾을 수 없습니다</p>
        <Link href={ROUTES.announcements}>
          <Button variant="outline">목록으로</Button>
        </Link>
      </div>
    );
  }

  return <AnnouncementDetail announcement={announcement} />;
}
