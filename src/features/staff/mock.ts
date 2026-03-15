import { format, startOfWeek, addDays, subMonths } from 'date-fns';
import type { Staff, Schedule, Attendance, LaborCostData } from './types';

const storeNames: Record<string, string> = {
  'store-1': '강남점',
  'store-2': '홍대점',
  'store-3': '명동점',
  'store-4': '잠실점',
  'store-5': '신촌점',
};

export const mockStaff: Staff[] = [
  {
    id: 'staff-1',
    brandId: 'brand-1',
    storeId: 'store-1',
    storeName: '강남점',
    name: '박지훈',
    role: 'manager',
    phone: '010-1234-5678',
    email: 'jihoon.park@example.com',
    hireDate: '2023-03-15',
    hourlyWage: 15000,
    monthlyHours: 176,
    monthlySalary: 2640000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2023-03-15T00:00:00Z',
  },
  {
    id: 'staff-2',
    brandId: 'brand-1',
    storeId: 'store-1',
    storeName: '강남점',
    name: '김서연',
    role: 'cook',
    phone: '010-2345-6789',
    email: 'seoyeon.kim@example.com',
    hireDate: '2023-04-01',
    hourlyWage: 13000,
    monthlyHours: 176,
    monthlySalary: 2288000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2023-04-01T00:00:00Z',
  },
  {
    id: 'staff-3',
    brandId: 'brand-1',
    storeId: 'store-1',
    storeName: '강남점',
    name: '이준호',
    role: 'server',
    phone: '010-3456-7890',
    email: 'junho.lee@example.com',
    hireDate: '2023-05-10',
    hourlyWage: 11000,
    monthlyHours: 160,
    monthlySalary: 1760000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2023-05-10T00:00:00Z',
  },
  {
    id: 'staff-4',
    brandId: 'brand-1',
    storeId: 'store-1',
    storeName: '강남점',
    name: '최유진',
    role: 'part_time',
    phone: '010-4567-8901',
    email: 'yujin.choi@example.com',
    hireDate: '2024-01-15',
    hourlyWage: 10000,
    monthlyHours: 80,
    monthlySalary: 800000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'staff-5',
    brandId: 'brand-1',
    storeId: 'store-2',
    storeName: '홍대점',
    name: '정민재',
    role: 'manager',
    phone: '010-5678-9012',
    email: 'minjae.jung@example.com',
    hireDate: '2023-05-01',
    hourlyWage: 14000,
    monthlyHours: 176,
    monthlySalary: 2464000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2023-05-01T00:00:00Z',
  },
  {
    id: 'staff-6',
    brandId: 'brand-1',
    storeId: 'store-2',
    storeName: '홍대점',
    name: '한소희',
    role: 'cook',
    phone: '010-6789-0123',
    email: 'sohee.han@example.com',
    hireDate: '2023-06-01',
    hourlyWage: 12500,
    monthlyHours: 176,
    monthlySalary: 2200000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2023-06-01T00:00:00Z',
  },
  {
    id: 'staff-7',
    brandId: 'brand-1',
    storeId: 'store-2',
    storeName: '홍대점',
    name: '윤도현',
    role: 'server',
    phone: '010-7890-1234',
    email: 'dohyun.yoon@example.com',
    hireDate: '2023-07-15',
    hourlyWage: 11000,
    monthlyHours: 160,
    monthlySalary: 1760000,
    status: 'on_leave',
    avatarUrl: null,
    createdAt: '2023-07-15T00:00:00Z',
  },
  {
    id: 'staff-8',
    brandId: 'brand-1',
    storeId: 'store-2',
    storeName: '홍대점',
    name: '배수지',
    role: 'part_time',
    phone: '010-8901-2345',
    email: 'suji.bae@example.com',
    hireDate: '2024-02-01',
    hourlyWage: 10000,
    monthlyHours: 64,
    monthlySalary: 640000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'staff-9',
    brandId: 'brand-1',
    storeId: 'store-2',
    storeName: '홍대점',
    name: '강다니엘',
    role: 'delivery',
    phone: '010-9012-3456',
    email: 'daniel.kang@example.com',
    hireDate: '2024-03-01',
    hourlyWage: 11500,
    monthlyHours: 120,
    monthlySalary: 1380000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'staff-10',
    brandId: 'brand-1',
    storeId: 'store-3',
    storeName: '명동점',
    name: '송중기',
    role: 'manager',
    phone: '010-0123-4567',
    email: 'jungki.song@example.com',
    hireDate: '2023-06-20',
    hourlyWage: 14500,
    monthlyHours: 176,
    monthlySalary: 2552000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2023-06-20T00:00:00Z',
  },
  {
    id: 'staff-11',
    brandId: 'brand-1',
    storeId: 'store-3',
    storeName: '명동점',
    name: '전지현',
    role: 'cook',
    phone: '010-1111-2222',
    email: 'jihyun.jeon@example.com',
    hireDate: '2023-07-01',
    hourlyWage: 13000,
    monthlyHours: 176,
    monthlySalary: 2288000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2023-07-01T00:00:00Z',
  },
  {
    id: 'staff-12',
    brandId: 'brand-1',
    storeId: 'store-3',
    storeName: '명동점',
    name: '유아인',
    role: 'server',
    phone: '010-2222-3333',
    email: 'ain.yoo@example.com',
    hireDate: '2023-08-15',
    hourlyWage: 11000,
    monthlyHours: 160,
    monthlySalary: 1760000,
    status: 'inactive',
    avatarUrl: null,
    createdAt: '2023-08-15T00:00:00Z',
  },
  {
    id: 'staff-13',
    brandId: 'brand-1',
    storeId: 'store-3',
    storeName: '명동점',
    name: '김태리',
    role: 'part_time',
    phone: '010-3333-4444',
    email: 'taeri.kim@example.com',
    hireDate: '2024-04-01',
    hourlyWage: 10000,
    monthlyHours: 96,
    monthlySalary: 960000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'staff-14',
    brandId: 'brand-1',
    storeId: 'store-4',
    storeName: '잠실점',
    name: '박보검',
    role: 'manager',
    phone: '010-4444-5555',
    email: 'bogum.park@example.com',
    hireDate: '2023-08-10',
    hourlyWage: 14000,
    monthlyHours: 176,
    monthlySalary: 2464000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2023-08-10T00:00:00Z',
  },
  {
    id: 'staff-15',
    brandId: 'brand-1',
    storeId: 'store-4',
    storeName: '잠실점',
    name: '수지',
    role: 'cook',
    phone: '010-5555-6666',
    email: 'suji@example.com',
    hireDate: '2023-09-01',
    hourlyWage: 12000,
    monthlyHours: 176,
    monthlySalary: 2112000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2023-09-01T00:00:00Z',
  },
  {
    id: 'staff-16',
    brandId: 'brand-1',
    storeId: 'store-4',
    storeName: '잠실점',
    name: '차은우',
    role: 'server',
    phone: '010-6666-7777',
    email: 'eunwoo.cha@example.com',
    hireDate: '2024-01-10',
    hourlyWage: 11000,
    monthlyHours: 160,
    monthlySalary: 1760000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'staff-17',
    brandId: 'brand-1',
    storeId: 'store-4',
    storeName: '잠실점',
    name: '아이유',
    role: 'part_time',
    phone: '010-7777-8888',
    email: 'iu@example.com',
    hireDate: '2024-05-01',
    hourlyWage: 10500,
    monthlyHours: 72,
    monthlySalary: 756000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2024-05-01T00:00:00Z',
  },
  {
    id: 'staff-18',
    brandId: 'brand-1',
    storeId: 'store-5',
    storeName: '신촌점',
    name: '공유',
    role: 'manager',
    phone: '010-8888-9999',
    email: 'gong.yoo@example.com',
    hireDate: '2023-09-05',
    hourlyWage: 14000,
    monthlyHours: 176,
    monthlySalary: 2464000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2023-09-05T00:00:00Z',
  },
  {
    id: 'staff-19',
    brandId: 'brand-1',
    storeId: 'store-5',
    storeName: '신촌점',
    name: '손예진',
    role: 'cook',
    phone: '010-9999-0000',
    email: 'yejin.son@example.com',
    hireDate: '2023-10-01',
    hourlyWage: 12500,
    monthlyHours: 176,
    monthlySalary: 2200000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2023-10-01T00:00:00Z',
  },
  {
    id: 'staff-20',
    brandId: 'brand-1',
    storeId: 'store-5',
    storeName: '신촌점',
    name: '현빈',
    role: 'delivery',
    phone: '010-0000-1111',
    email: 'hyunbin@example.com',
    hireDate: '2024-02-15',
    hourlyWage: 11500,
    monthlyHours: 128,
    monthlySalary: 1472000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'staff-21',
    brandId: 'brand-1',
    storeId: 'store-5',
    storeName: '신촌점',
    name: '김수현',
    role: 'server',
    phone: '010-1122-3344',
    email: 'soohyun.kim@example.com',
    hireDate: '2024-03-10',
    hourlyWage: 11000,
    monthlyHours: 160,
    monthlySalary: 1760000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'staff-22',
    brandId: 'brand-1',
    storeId: 'store-5',
    storeName: '신촌점',
    name: '장원영',
    role: 'part_time',
    phone: '010-2233-4455',
    email: 'wonyoung.jang@example.com',
    hireDate: '2024-06-01',
    hourlyWage: 10000,
    monthlyHours: 60,
    monthlySalary: 600000,
    status: 'active',
    avatarUrl: null,
    createdAt: '2024-06-01T00:00:00Z',
  },
];

function generateWeeklySchedules(): Schedule[] {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const schedules: Schedule[] = [];
  let scheduleId = 1;

  const activeStaff = mockStaff.filter((s) => s.status === 'active');

  for (const staff of activeStaff) {
    const shiftsPerWeek = staff.role === 'part_time' ? 3 : staff.role === 'delivery' ? 5 : 5;
    const startHour = staff.role === 'cook' ? 8 : staff.role === 'delivery' ? 11 : 9;
    const endHour = staff.role === 'part_time' ? startHour + 5 : startHour + 8;

    for (let d = 0; d < shiftsPerWeek; d++) {
      const date = addDays(weekStart, d);
      schedules.push({
        id: `schedule-${scheduleId++}`,
        staffId: staff.id,
        staffName: staff.name,
        storeId: staff.storeId,
        date: format(date, 'yyyy-MM-dd'),
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(endHour).padStart(2, '0')}:00`,
        breakMinutes: staff.role === 'part_time' ? 0 : 60,
        workHours: endHour - startHour - (staff.role === 'part_time' ? 0 : 1),
        memo: '',
      });
    }
  }

  return schedules;
}

function generateMonthlyAttendance(): Attendance[] {
  const today = new Date();
  const records: Attendance[] = [];
  let attId = 1;

  const activeStaff = mockStaff.filter((s) => s.status === 'active');
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();

  for (const staff of activeStaff) {
    const shiftsPerWeek = staff.role === 'part_time' ? 3 : 5;
    const startHour = staff.role === 'cook' ? 8 : staff.role === 'delivery' ? 11 : 9;
    const endHour = staff.role === 'part_time' ? startHour + 5 : startHour + 8;

    for (let d = 1; d <= Math.min(currentDay, daysInMonth); d++) {
      const date = new Date(today.getFullYear(), today.getMonth(), d);
      const dayOfWeek = date.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        if (staff.role !== 'part_time') {
          records.push({
            id: `att-${attId++}`,
            staffId: staff.id,
            staffName: staff.name,
            storeId: staff.storeId,
            date: format(date, 'yyyy-MM-dd'),
            checkIn: null,
            checkOut: null,
            scheduledIn: `${String(startHour).padStart(2, '0')}:00`,
            scheduledOut: `${String(endHour).padStart(2, '0')}:00`,
            status: 'day_off',
            overtimeHours: 0,
            memo: '',
          });
        }
        continue;
      }

      if (staff.role === 'part_time' && dayOfWeek > shiftsPerWeek) {
        continue;
      }

      const rand = Math.random();
      let status: Attendance['status'] = 'present';
      let checkInMinutes = 0;
      let overtime = 0;

      if (rand < 0.05) {
        status = 'absent';
      } else if (rand < 0.12) {
        status = 'late';
        checkInMinutes = Math.floor(Math.random() * 30) + 5;
      } else if (rand < 0.15) {
        status = 'early_leave';
      } else {
        overtime = Math.random() < 0.2 ? Math.floor(Math.random() * 3) + 1 : 0;
      }

      const actualStartHour = startHour + Math.floor(checkInMinutes / 60);
      const actualStartMin = checkInMinutes % 60;

      records.push({
        id: `att-${attId++}`,
        staffId: staff.id,
        staffName: staff.name,
        storeId: staff.storeId,
        date: format(date, 'yyyy-MM-dd'),
        checkIn: status === 'absent' ? null : `${String(actualStartHour).padStart(2, '0')}:${String(actualStartMin).padStart(2, '0')}`,
        checkOut: status === 'absent' ? null : status === 'early_leave' ? `${String(endHour - 2).padStart(2, '0')}:00` : `${String(endHour + overtime).padStart(2, '0')}:00`,
        scheduledIn: `${String(startHour).padStart(2, '0')}:00`,
        scheduledOut: `${String(endHour).padStart(2, '0')}:00`,
        status,
        overtimeHours: overtime,
        memo: status === 'absent' ? '무단결근' : status === 'late' ? '지각' : '',
      });
    }
  }

  return records;
}

function generateLaborCostData(): LaborCostData[] {
  const today = new Date();
  const data: LaborCostData[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i);
    const headcount = 18 + Math.floor(Math.random() * 5);
    const baseCost = headcount * 1800000 + Math.floor(Math.random() * 2000000);
    const overtimeCost = Math.floor(Math.random() * 800000) + 200000;

    data.push({
      month: format(date, 'yyyy-MM'),
      totalCost: baseCost + overtimeCost,
      headcount,
      avgCost: Math.round((baseCost + overtimeCost) / headcount),
      overtimeCost,
    });
  }

  return data;
}

export const mockSchedules: Schedule[] = generateWeeklySchedules();
export const mockAttendance: Attendance[] = generateMonthlyAttendance();
export const mockLaborCost: LaborCostData[] = generateLaborCostData();

export function getMockStaffById(id: string): Staff | undefined {
  return mockStaff.find((s) => s.id === id);
}

export function getMockSchedulesByStaffId(staffId: string): Schedule[] {
  return mockSchedules.filter((s) => s.staffId === staffId);
}

export function getMockAttendanceByStaffId(staffId: string): Attendance[] {
  return mockAttendance.filter((a) => a.staffId === staffId);
}

export function createMockStaff(data: Partial<Staff>): Staff {
  const id = `staff-${Date.now()}`;
  const store = storeNames[data.storeId ?? 'store-1'] ?? '강남점';
  const hourlyWage = data.hourlyWage ?? 10000;
  const monthlyHours = data.role === 'part_time' ? 80 : 176;

  return {
    id,
    brandId: 'brand-1',
    storeId: data.storeId ?? 'store-1',
    storeName: store,
    name: data.name ?? '',
    role: (data.role as Staff['role']) ?? 'server',
    phone: data.phone ?? '',
    email: data.email ?? '',
    hireDate: data.hireDate ?? format(new Date(), 'yyyy-MM-dd'),
    hourlyWage,
    monthlyHours,
    monthlySalary: hourlyWage * monthlyHours,
    status: 'active',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
  };
}

export function createMockSchedule(data: {
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  memo?: string;
}): Schedule {
  const staff = getMockStaffById(data.staffId);
  const start = parseInt(data.startTime.split(':')[0], 10);
  const end = parseInt(data.endTime.split(':')[0], 10);

  return {
    id: `schedule-${Date.now()}`,
    staffId: data.staffId,
    staffName: staff?.name ?? '',
    storeId: staff?.storeId ?? 'store-1',
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    breakMinutes: data.breakMinutes,
    workHours: end - start - data.breakMinutes / 60,
    memo: data.memo ?? '',
  };
}
