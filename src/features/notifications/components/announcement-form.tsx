'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES } from '@/constants';
import { useAnnouncementForm } from '../hooks';
import type { AnnouncementFormValues } from '../schema';

export function AnnouncementForm() {
  const router = useRouter();
  const { form, isSubmitting, submitAnnouncement } = useAnnouncementForm();

  const onSubmit = async (data: AnnouncementFormValues) => {
    try {
      await submitAnnouncement(data);
      toast.success('공지사항이 등록되었습니다');
      router.push(ROUTES.announcements);
    } catch {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">공지사항 작성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              placeholder="공지사항 제목을 입력하세요"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <Textarea
              id="content"
              placeholder="공지사항 내용을 입력하세요"
              rows={10}
              {...form.register('content')}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>우선순위 *</Label>
              <Select
                defaultValue="normal"
                onValueChange={(value) =>
                  form.setValue('priority', value as AnnouncementFormValues['priority'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="우선순위 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">긴급</SelectItem>
                  <SelectItem value="normal">일반</SelectItem>
                  <SelectItem value="low">참고</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.priority && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.priority.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>대상 *</Label>
              <Select
                defaultValue="all"
                onValueChange={(value) =>
                  form.setValue('targetRole', value as AnnouncementFormValues['targetRole'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="대상 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="owner">점주</SelectItem>
                  <SelectItem value="manager">매니저</SelectItem>
                  <SelectItem value="staff">직원</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.targetRole && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.targetRole.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isPinned"
              checked={form.watch('isPinned')}
              onCheckedChange={(checked) => form.setValue('isPinned', checked)}
            />
            <Label htmlFor="isPinned">상단 고정</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(ROUTES.announcements)}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '등록'}
        </Button>
      </div>
    </form>
  );
}
