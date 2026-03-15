import { z } from 'zod';

export const inspectionItemSchema = z.object({
  itemId: z.string(),
  score: z.number().min(0, '점수는 0 이상이어야 합니다'),
  notes: z.string(),
});

export const inspectionFormSchema = z.object({
  templateId: z.string().min(1, '점검 템플릿을 선택해주세요'),
  storeId: z.string().min(1, '매장을 선택해주세요'),
  inspectionDate: z.string().min(1, '점검일을 입력해주세요'),
  items: z.array(inspectionItemSchema).min(1, '점검 항목이 필요합니다'),
  notes: z.string(),
});

export type InspectionFormValues = z.infer<typeof inspectionFormSchema>;

export const templateItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '항목명을 입력해주세요'),
  category: z.enum(['위생', '서비스', '시설', '안전'], {
    required_error: '카테고리를 선택해주세요',
  }),
  maxScore: z.number().min(1, '최대 점수는 1 이상이어야 합니다').max(100),
  description: z.string(),
});

export const templateFormSchema = z.object({
  name: z.string().min(2, '템플릿명은 2자 이상이어야 합니다'),
  description: z.string(),
  category: z.enum(['위생', '서비스', '시설', '안전'], {
    required_error: '카테고리를 선택해주세요',
  }),
  items: z.array(templateItemSchema).min(1, '최소 1개 이상의 항목이 필요합니다'),
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;
