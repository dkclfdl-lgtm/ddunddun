'use client';

import Link from 'next/link';
import { Pin, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import { ROUTES } from '@/constants';
import { EmptyState } from '@/components/common';
import type { Announcement, AnnouncementPriority, AnnouncementTargetRole } from '../types';

const PRIORITY_CONFIG: Record<AnnouncementPriority, { label: string; color: string }> = {
  high: { label: '긴급', color: 'bg-red-100 text-red-700 border-transparent' },
  normal: { label: '일반', color: 'bg-blue-100 text-blue-700 border-transparent' },
  low: { label: '참고', color: 'bg-gray-100 text-gray-600 border-transparent' },
};

const TARGET_ROLE_LABEL: Record<AnnouncementTargetRole, string> = {
  all: '전체',
  owner: '점주',
  manager: '매니저',
  staff: '직원',
};

interface AnnouncementListProps {
  announcements: Announcement[];
}

export function AnnouncementList({ announcements }: AnnouncementListProps) {
  if (announcements.length === 0) {
    return (
      <EmptyState
        title="공지사항이 없습니다"
        description="새로운 공지사항을 작성해보세요."
      />
    );
  }

  return (
    <div className="space-y-2">
      {announcements.map((announcement) => {
        const priorityConfig = PRIORITY_CONFIG[announcement.priority];

        return (
          <Link
            key={announcement.id}
            href={`${ROUTES.announcements}/${announcement.id}`}
          >
            <Card className="cursor-pointer border-border transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-3 p-4">
                {announcement.isPinned && (
                  <Pin className="h-4 w-4 shrink-0 rotate-45 text-[#03C75A]" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn('shrink-0 text-xs', priorityConfig.color)}
                    >
                      {priorityConfig.label}
                    </Badge>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {TARGET_ROLE_LABEL[announcement.targetRole]}
                    </Badge>
                    <h4 className="truncate text-sm font-medium text-foreground">
                      {announcement.title}
                    </h4>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{announcement.authorName}</span>
                    <span>·</span>
                    <span>{formatDate(announcement.publishedAt)}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
