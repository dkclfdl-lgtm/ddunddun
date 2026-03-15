'use client';

import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProfileSettings } from '../hooks';
import type { ProfileFormValues } from '../schema';

export function ProfileForm() {
  const { form, isSubmitting, saveProfile } = useProfileSettings();

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await saveProfile(data);
      toast.success('프로필이 저장되었습니다');
    } catch {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const avatarUrl = form.watch('avatarUrl');
  const name = form.watch('name');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">프로필 사진</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="text-lg">
                {name?.slice(0, 2) ?? '??'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Input
                placeholder="이미지 URL을 입력하세요"
                {...form.register('avatarUrl')}
              />
              <p className="text-xs text-muted-foreground">
                프로필 이미지 URL을 입력해주세요
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                placeholder="이름을 입력하세요"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">연락처 *</Label>
            <Input
              id="phone"
              placeholder="010-1234-5678"
              {...form.register('phone')}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>언어</Label>
              <Select
                defaultValue={form.getValues('language')}
                onValueChange={(value) => form.setValue('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="언어 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>시간대</Label>
              <Select
                defaultValue={form.getValues('timezone')}
                onValueChange={(value) => form.setValue('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="시간대 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Seoul">서울 (UTC+9)</SelectItem>
                  <SelectItem value="Asia/Tokyo">도쿄 (UTC+9)</SelectItem>
                  <SelectItem value="America/New_York">뉴욕 (UTC-5)</SelectItem>
                  <SelectItem value="Europe/London">런던 (UTC+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
