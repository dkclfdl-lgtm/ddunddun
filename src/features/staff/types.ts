export interface Staff {
  id: string;
  brandId: string;
  storeId: string;
  storeName: string;
  name: string;
  role: 'manager' | 'cook' | 'server' | 'part_time' | 'delivery';
  phone: string;
  email: string;
  hireDate: string;
  hourlyWage: number;
  monthlyHours: number;
  monthlySalary: number;
  status: 'active' | 'inactive' | 'on_leave';
  avatarUrl: string | null;
  createdAt: string;
}

export interface Schedule {
  id: string;
  staffId: string;
  staffName: string;
  storeId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  workHours: number;
  memo: string;
}

export interface Attendance {
  id: string;
  staffId: string;
  staffName: string;
  storeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  scheduledIn: string;
  scheduledOut: string;
  status: 'present' | 'late' | 'absent' | 'early_leave' | 'day_off';
  overtimeHours: number;
  memo: string;
}

export interface StaffFormData {
  name: string;
  storeId: string;
  role: string;
  phone: string;
  email: string;
  hireDate: string;
  hourlyWage: number;
}

export interface StaffFilters {
  search: string;
  storeId: string;
  role: string;
  status: string;
}

export interface LaborCostData {
  month: string;
  totalCost: number;
  headcount: number;
  avgCost: number;
  overtimeCost: number;
}
