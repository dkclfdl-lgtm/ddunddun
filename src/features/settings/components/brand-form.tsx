'use client';

import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBrandSettings } from '../hooks';
import type { BrandFormValues } from '../schema';

export function BrandForm() {
  const { form, isSubmitting, saveBrand } = useBrandSettings();

  const onSubmit = async (data: BrandFormValues) => {
    try {
      await saveBrand(data);
      toast.success('브랜드 정보가 저장되었습니다');
    } catch {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const logoUrl = form.watch('logoUrl');
  const brandName = form.watch('name');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">브랜드 로고</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 rounded-lg">
              <AvatarImage src={logoUrl} alt={brandName} />
              <AvatarFallback className="rounded-lg text-lg">
                {brandName?.slice(0, 2) ?? '??'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Input
                placeholder="로고 이미지 URL을 입력하세요"
                {...form.register('logoUrl')}
              />
              <p className="text-xs text-muted-foreground">
                브랜드 로고 이미지 URL을 입력해주세요
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">사업자 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brandName">브랜드명 *</Label>
              <Input
                id="brandName"
                placeholder="브랜드명을 입력하세요"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessNumber">사업자 등록번호 *</Label>
              <Input
                id="businessNumber"
                placeholder="123-45-67890"
                {...form.register('businessNumber')}
              />
              {form.formState.errors.businessNumber && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.businessNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="representative">대표자명 *</Label>
              <Input
                id="representative"
                placeholder="대표자명을 입력하세요"
                {...form.register('representative')}
              />
              {form.formState.errors.representative && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.representative.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandPhone">연락처 *</Label>
              <Input
                id="brandPhone"
                placeholder="02-1234-5678"
                {...form.register('phone')}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandEmail">이메일 *</Label>
            <Input
              id="brandEmail"
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

          <div className="space-y-2">
            <Label htmlFor="address">주소 *</Label>
            <Input
              id="address"
              placeholder="사업장 주소를 입력하세요"
              {...form.register('address')}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-destructive">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessHours">영업시간 *</Label>
            <Input
              id="businessHours"
              placeholder="매일 11:00 - 22:00"
              {...form.register('businessHours')}
            />
            {form.formState.errors.businessHours && (
              <p className="text-sm text-destructive">
                {form.formState.errors.businessHours.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">브랜드 설명</Label>
            <Textarea
              id="description"
              placeholder="브랜드 소개를 입력하세요"
              rows={4}
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
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
