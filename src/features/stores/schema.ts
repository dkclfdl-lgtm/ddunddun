import { z } from 'zod';

export const storeFormSchema = z.object({
  name: z.string().min(2, '매장명은 2자 이상이어야 합니다'),
  address: z.string().min(5, '주소를 입력해주세요'),
  phone: z
    .string()
    .regex(/^0\d{1,2}-\d{3,4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다 (예: 02-1234-5678)')
    .or(z.literal('')),
  status: z.enum(['active', 'inactive', 'closed', 'preparing'], {
    required_error: '상태를 선택해주세요',
  }),
  opening_date: z.string().optional(),
  owner_id: z.string().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

export type StoreFormValues = z.infer<typeof storeFormSchema>;
