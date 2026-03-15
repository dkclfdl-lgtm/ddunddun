import { z } from 'zod';

export const menuFormSchema = z.object({
  categoryId: z.string().min(1, '카테고리를 선택해주세요'),
  name: z.string().min(1, '상품명을 입력해주세요').max(50, '상품명은 50자 이내여야 합니다'),
  code: z
    .string()
    .min(1, '상품코드를 입력해주세요')
    .regex(/^[A-Za-z0-9-]+$/, '영문, 숫자, 하이픈만 사용 가능합니다'),
  price: z.number().min(0, '가격은 0 이상이어야 합니다'),
  costPrice: z.number().min(0, '원가는 0 이상이어야 합니다'),
  description: z.string().max(500, '설명은 500자 이내여야 합니다').optional().default(''),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
});

export type MenuFormValues = z.infer<typeof menuFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(1, '카테고리명을 입력해주세요').max(30, '카테고리명은 30자 이내여야 합니다'),
  code: z
    .string()
    .min(1, '카테고리코드를 입력해주세요')
    .regex(/^[A-Z]\d{3}$/, '코드 형식: 대문자 1자 + 숫자 3자 (예: C001)'),
  isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
