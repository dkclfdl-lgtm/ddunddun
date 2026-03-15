import { z } from 'zod';

export const announcementFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이내로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요').max(5000, '내용은 5000자 이내로 입력해주세요'),
  priority: z.enum(['high', 'normal', 'low'], {
    required_error: '우선순위를 선택해주세요',
  }),
  targetRole: z.enum(['all', 'owner', 'manager', 'staff'], {
    required_error: '대상을 선택해주세요',
  }),
  isPinned: z.boolean(),
});

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
