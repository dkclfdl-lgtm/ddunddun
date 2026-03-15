'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common';
import { ROUTES } from '@/constants';
import { useAnnouncements } from '@/features/notifications/hooks';
import { AnnouncementList } from '@/features/notifications/components/announcement-list';

export default function AnnouncementsPage() {
  const { announcements } = useAnnouncements();

  return (
    <div className="space-y-6">
      <PageHeader
        title="공지사항"
        description="본사 공지사항 및 안내 사항을 확인하세요"
      >
        <Link href={`${ROUTES.announcements}/new`}>
          <Button>
            <Plus size={16} className="mr-1.5" />
            공지 작성
          </Button>
        </Link>
      </PageHeader>

      <AnnouncementList announcements={announcements} />
    </div>
  );
}
