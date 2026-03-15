import { z } from 'zod';

export const inventoryFormSchema = z.object({
  itemName: z.string().min(1, '품목명을 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  unit: z.string().min(1, '단위를 입력해주세요'),
  currentStock: z.number().min(0, '현재 재고는 0 이상이어야 합니다'),
  minStock: z.number().min(0, '최소 재고는 0 이상이어야 합니다'),
  maxStock: z.number().min(1, '최대 재고는 1 이상이어야 합니다'),
  unitCost: z.number().min(0, '단가는 0 이상이어야 합니다'),
  supplier: z.string().min(1, '공급업체를 입력해주세요'),
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

export const stockAdjustSchema = z.object({
  type: z.enum(['in', 'out', 'adjust'], {
    required_error: '유형을 선택해주세요',
  }),
  quantity: z.number().min(1, '수량은 1 이상이어야 합니다'),
  memo: z.string().min(1, '사유를 입력해주세요'),
});

export type StockAdjustValues = z.infer<typeof stockAdjustSchema>;

export const purchaseOrderFormSchema = z.object({
  storeId: z.string().min(1, '매장을 선택해주세요'),
  supplier: z.string().min(1, '공급업체를 입력해주세요'),
  items: z
    .array(
      z.object({
        inventoryId: z.string().min(1),
        itemName: z.string().min(1),
        quantity: z.number().min(1, '수량은 1 이상이어야 합니다'),
        unitCost: z.number().min(0),
      })
    )
    .min(1, '품목을 하나 이상 추가해주세요'),
  expectedAt: z.string().min(1, '예상 입고일을 입력해주세요'),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>;
