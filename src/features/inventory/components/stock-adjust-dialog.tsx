'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InventoryItem } from '../types';
import { useStockAdjust } from '../hooks';

interface StockAdjustDialogProps {
  item: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjusted: () => void;
}

const TYPE_OPTIONS = [
  { value: 'in', label: '입고', description: '재고 추가' },
  { value: 'out', label: '출고', description: '재고 차감' },
  { value: 'adjust', label: '조정', description: '재고 보정 (음수 가능)' },
] as const;

export function StockAdjustDialog({
  item,
  open,
  onOpenChange,
  onAdjusted,
}: StockAdjustDialogProps) {
  const { form, isSubmitting, submitAdjust } = useStockAdjust();

  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await submitAdjust(item.id, data);
    if (result) {
      form.reset();
      onAdjusted();
    }
  });

  const selectedType = form.watch('type');
  const quantity = form.watch('quantity');
  const previewStock =
    selectedType === 'in'
      ? item.currentStock + (quantity || 0)
      : selectedType === 'out'
        ? Math.max(0, item.currentStock - (quantity || 0))
        : item.currentStock + (quantity || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>재고 조정</DialogTitle>
          <DialogDescription>
            {item.itemName} ({item.storeName}) - 현재 재고: {item.currentStock}{' '}
            {item.unit}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>조정 유형</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(value: 'in' | 'out' | 'adjust') =>
                form.setValue('type', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label} - {opt.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-xs text-destructive">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>수량 ({item.unit})</Label>
            <Input
              type="number"
              min={1}
              {...form.register('quantity', { valueAsNumber: true })}
            />
            {form.formState.errors.quantity && (
              <p className="text-xs text-destructive">
                {form.formState.errors.quantity.message}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">변경 후 예상 재고</span>
              <span className="font-semibold">
                {previewStock} {item.unit}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>사유</Label>
            <Textarea
              placeholder="재고 조정 사유를 입력해주세요"
              rows={3}
              {...form.register('memo')}
            />
            {form.formState.errors.memo && (
              <p className="text-xs text-destructive">
                {form.formState.errors.memo.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : '조정 완료'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
