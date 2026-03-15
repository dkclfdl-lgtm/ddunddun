import { z } from 'zod';

export const profileFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  phone: z.string().min(1, '연락처를 입력해주세요'),
  avatarUrl: z.string(),
  language: z.string().min(1, '언어를 선택해주세요'),
  timezone: z.string().min(1, '시간대를 선택해주세요'),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const brandFormSchema = z.object({
  name: z.string().min(1, '브랜드명을 입력해주세요'),
  logoUrl: z.string(),
  businessNumber: z.string().min(1, '사업자 등록번호를 입력해주세요'),
  representative: z.string().min(1, '대표자명을 입력해주세요'),
  phone: z.string().min(1, '연락처를 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  address: z.string().min(1, '주소를 입력해주세요'),
  businessHours: z.string().min(1, '영업시간을 입력해주세요'),
  description: z.string().max(500, '설명은 500자 이내로 입력해주세요'),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;
