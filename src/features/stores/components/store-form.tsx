'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import { ROUTES, STORE_STATUS_MAP } from '@/constants';
import { storeFormSchema, type StoreFormValues } from '../schema';
import { useStoreForm } from '../hooks';

interface StoreFormProps {
  storeId?: string;
}

export function StoreForm({ storeId }: StoreFormProps) {
  const router = useRouter();
  const { defaultValues, isSubmitting, submitStore, isEditing } = useStoreForm(storeId);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: StoreFormValues) => {
    try {
      await submitStore(data);
      toast.success(isEditing ? '매장이 수정되었습니다' : '매장이 등록되었습니다');
      router.push(ROUTES.stores);
    } catch {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">매장명 *</Label>
              <Input
                id="name"
                placeholder="매장명을 입력하세요"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">상태 *</Label>
              <Select
                defaultValue={defaultValues.status}
                onValueChange={(value) => form.setValue('status', value as StoreFormValues['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STORE_STATUS_MAP).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">주소 *</Label>
            <Input
              id="address"
              placeholder="매장 주소를 입력하세요"
              {...form.register('address')}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                placeholder="02-1234-5678"
                {...form.register('phone')}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="opening_date">오픈일</Label>
              <Input
                id="opening_date"
                type="date"
                {...form.register('opening_date')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(ROUTES.stores)}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : isEditing ? '수정' : '등록'}
        </Button>
      </div>
    </form>
  );
}
