'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/constants';
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

interface AnnouncementDetailProps {
  announcement: Announcement;
}

export function AnnouncementDetail({ announcement }: AnnouncementDetailProps) {
  const router = useRouter();
  const priorityConfig = PRIORITY_CONFIG[announcement.priority];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(ROUTES.announcements)}
        className="gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로
      </Button>

      <Card className="border-border">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            {announcement.isPinned && (
              <Pin className="h-4 w-4 rotate-45 text-[#03C75A]" />
            )}
            <Badge
              variant="outline"
              className={cn('text-xs', priorityConfig.color)}
            >
              {priorityConfig.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {TARGET_ROLE_LABEL[announcement.targetRole]}
            </Badge>
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {announcement.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{announcement.authorName}</span>
            <span>·</span>
            <span>{formatDateTime(announcement.publishedAt)}</span>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {announcement.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
