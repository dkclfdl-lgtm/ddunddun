'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Staff, StaffFilters, Schedule, Attendance, LaborCostData } from './types';
import type { StaffFormValues } from './schema';
import {
  mockStaff,
  mockSchedules,
  mockAttendance,
  mockLaborCost,
  getMockStaffById,
  getMockSchedulesByStaffId,
  getMockAttendanceByStaffId,
  createMockStaff,
  createMockSchedule,
} from './mock';

export function useStaffList() {
  const [staffList, setStaffList] = useState<Staff[]>(mockStaff);
  const [filters, setFilters] = useState<StaffFilters>({
    search: '',
    storeId: 'all',
    role: 'all',
    status: 'all',
  });

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch =
        !filters.search ||
        s.name.includes(filters.search) ||
        s.phone.includes(filters.search) ||
        s.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStore = filters.storeId === 'all' || s.storeId === filters.storeId;
      const matchesRole = filters.role === 'all' || s.role === filters.role;
      const matchesStatus = filters.status === 'all' || s.status === filters.status;
      return matchesSearch && matchesStore && matchesRole && matchesStatus;
    });
  }, [staffList, filters]);

  const updateFilter = useCallback(<K extends keyof StaffFilters>(key: K, value: StaffFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const deleteStaff = useCallback((id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const stats = useMemo(() => {
    const active = staffList.filter((s) => s.status === 'active').length;
    const partTime = staffList.filter((s) => s.role === 'part_time').length;
    const totalMonthlyCost = staffList
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + s.monthlySalary, 0);

    return {
      total: staffList.length,
      active,
      partTime,
      totalMonthlyCost,
    };
  }, [staffList]);

  return {
    staffList: filteredStaff,
    allStaff: staffList,
    filters,
    updateFilter,
    deleteStaff,
    stats,
  };
}

export function useStaffDetail(staffId: string) {
  const [staff] = useState<Staff | undefined>(() => getMockStaffById(staffId));
  const [schedules] = useState<Schedule[]>(() => getMockSchedulesByStaffId(staffId));
  const [attendance] = useState<Attendance[]>(() => getMockAttendanceByStaffId(staffId));
  const [isLoading] = useState(false);

  const attendanceSummary = useMemo(() => {
    const present = attendance.filter((a) => a.status === 'present').length;
    const late = attendance.filter((a) => a.status === 'late').length;
    const absent = attendance.filter((a) => a.status === 'absent').length;
    const earlyLeave = attendance.filter((a) => a.status === 'early_leave').length;
    const totalOvertime = attendance.reduce((sum, a) => sum + a.overtimeHours, 0);

    return { present, late, absent, earlyLeave, totalOvertime };
  }, [attendance]);

  return { staff, schedules, attendance, attendanceSummary, isLoading };
}

export function useStaffForm(staffId?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const existingStaff = staffId ? getMockStaffById(staffId) : undefined;

  const defaultValues: StaffFormValues = existingStaff
    ? {
        name: existingStaff.name,
        storeId: existingStaff.storeId,
        role: existingStaff.role,
        phone: existingStaff.phone,
        email: existingStaff.email,
        hireDate: existingStaff.hireDate,
        hourlyWage: existingStaff.hourlyWage,
      }
    : {
        name: '',
        storeId: '',
        role: 'server',
        phone: '',
        email: '',
        hireDate: '',
        hourlyWage: 10000,
      };

  const submitStaff = useCallback(async (data: StaffFormValues): Promise<Staff> => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const staff = createMockStaff(data);
    setIsSubmitting(false);
    return staff;
  }, []);

  return { defaultValues, isSubmitting, submitStaff, isEditing: !!staffId };
}

export function useSchedule(storeId: string) {
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);

  const filteredSchedules = useMemo(() => {
    if (storeId === 'all') return schedules;
    return schedules.filter((s) => s.storeId === storeId);
  }, [schedules, storeId]);

  const addSchedule = useCallback((data: {
    staffId: string;
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    memo?: string;
  }) => {
    const newSchedule = createMockSchedule(data);
    setSchedules((prev) => [...prev, newSchedule]);
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { schedules: filteredSchedules, addSchedule, deleteSchedule };
}

export function useAttendance(storeId: string) {
  const [records] = useState<Attendance[]>(mockAttendance);

  const filteredRecords = useMemo(() => {
    if (storeId === 'all') return records;
    return records.filter((r) => r.storeId === storeId);
  }, [records, storeId]);

  const summary = useMemo(() => {
    const present = filteredRecords.filter((r) => r.status === 'present').length;
    const late = filteredRecords.filter((r) => r.status === 'late').length;
    const absent = filteredRecords.filter((r) => r.status === 'absent').length;
    const earlyLeave = filteredRecords.filter((r) => r.status === 'early_leave').length;
    const dayOff = filteredRecords.filter((r) => r.status === 'day_off').length;
    const totalOvertime = filteredRecords.reduce((sum, r) => sum + r.overtimeHours, 0);

    return { present, late, absent, earlyLeave, dayOff, totalOvertime, total: filteredRecords.length };
  }, [filteredRecords]);

  return { records: filteredRecords, summary };
}

export function useLaborCost() {
  const [data] = useState<LaborCostData[]>(mockLaborCost);
  return { data };
}
