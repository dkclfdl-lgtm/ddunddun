import { z } from 'zod';

export const staffFormSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  storeId: z.string().min(1, '매장을 선택해주세요'),
  role: z.enum(['manager', 'cook', 'server', 'part_time', 'delivery'], {
    required_error: '역할을 선택해주세요',
  }),
  phone: z
    .string()
    .regex(/^01[016789]-\d{3,4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  hireDate: z.string().min(1, '입사일을 입력해주세요'),
  hourlyWage: z.number().min(9860, '최저시급 이상이어야 합니다'),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;

export const scheduleFormSchema = z.object({
  staffId: z.string().min(1, '직원을 선택해주세요'),
  date: z.string().min(1, '날짜를 입력해주세요'),
  startTime: z.string().min(1, '시작 시간을 입력해주세요'),
  endTime: z.string().min(1, '종료 시간을 입력해주세요'),
  breakMinutes: z.number().min(0, '휴게시간은 0분 이상이어야 합니다'),
  memo: z.string().optional(),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export const attendanceFormSchema = z.object({
  staffId: z.string().min(1, '직원을 선택해주세요'),
  date: z.string().min(1, '날짜를 입력해주세요'),
  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),
  status: z.enum(['present', 'late', 'absent', 'early_leave', 'day_off'], {
    required_error: '출근 상태를 선택해주세요',
  }),
  overtimeHours: z.number().min(0).optional(),
  memo: z.string().optional(),
});

export type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;
