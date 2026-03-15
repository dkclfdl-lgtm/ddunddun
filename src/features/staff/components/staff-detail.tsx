'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, Clock, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/common';
import { formatCurrency, formatDate, formatPhone, formatNumber } from '@/lib/format';
import { ROUTES } from '@/constants';
import { useStaffDetail } from '../hooks';

const ROLE_LABEL: Record<string, string> = {
  manager: '매니저',
  cook: '주방',
  server: '서빙',
  part_time: '파트타임',
  delivery: '배달',
};

const ROLE_COLOR: Record<string, string> = {
  manager: 'bg-purple-100 text-purple-700',
  cook: 'bg-orange-100 text-orange-700',
  server: 'bg-blue-100 text-blue-700',
  part_time: 'bg-cyan-100 text-cyan-700',
  delivery: 'bg-green-100 text-green-700',
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '재직중', color: 'bg-green-100 text-green-700' },
  inactive: { label: '퇴직', color: 'bg-red-100 text-red-700' },
  on_leave: { label: '휴직', color: 'bg-yellow-100 text-yellow-700' },
};

const ATTENDANCE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  present: { label: '출근', color: 'bg-green-100 text-green-700' },
  late: { label: '지각', color: 'bg-yellow-100 text-yellow-700' },
  absent: { label: '결근', color: 'bg-red-100 text-red-700' },
  early_leave: { label: '조퇴', color: 'bg-orange-100 text-orange-700' },
  day_off: { label: '휴무', color: 'bg-gray-100 text-gray-500' },
};

interface StaffDetailProps {
  staffId: string;
}

export function StaffDetail({ staffId }: StaffDetailProps) {
  const { staff, schedules, attendance, attendanceSummary, isLoading } = useStaffDetail(staffId);

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground">로딩 중...</div>;
  }

  if (!staff) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">직원을 찾을 수 없습니다</p>
        <Link href={ROUTES.staff}>
          <Button variant="outline">직원 목록으로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={ROUTES.staff}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{staff.name}</h1>
            <Badge variant="outline" className={`border-transparent ${ROLE_COLOR[staff.role] ?? ''}`}>
              {ROLE_LABEL[staff.role] ?? staff.role}
            </Badge>
            <StatusBadge status={staff.status} statusMap={STATUS_MAP} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{staff.storeName}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">연락처</p>
              <p className="text-sm font-medium">{formatPhone(staff.phone)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">이메일</p>
              <p className="text-sm font-medium">{staff.email}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">입사일</p>
              <p className="text-sm font-medium">{formatDate(staff.hireDate)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">시급 / 월급</p>
              <p className="text-sm font-medium">
                {formatCurrency(staff.hourlyWage)} / {formatCurrency(staff.monthlySalary)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>이번달 출근 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <p className="text-xs text-muted-foreground">출근</p>
              <p className="text-xl font-bold text-green-600">{attendanceSummary.present}</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 text-center">
              <p className="text-xs text-muted-foreground">지각</p>
              <p className="text-xl font-bold text-yellow-600">{attendanceSummary.late}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-center">
              <p className="text-xs text-muted-foreground">결근</p>
              <p className="text-xl font-bold text-red-600">{attendanceSummary.absent}</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 text-center">
              <p className="text-xs text-muted-foreground">조퇴</p>
              <p className="text-xl font-bold text-orange-600">{attendanceSummary.earlyLeave}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <p className="text-xs text-muted-foreground">초과근무</p>
              <p className="text-xl font-bold text-blue-600">{attendanceSummary.totalOvertime}h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule History */}
      <Card>
        <CardHeader>
          <CardTitle>이번주 스케줄</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>날짜</TableHead>
                  <TableHead>시작</TableHead>
                  <TableHead>종료</TableHead>
                  <TableHead>휴게</TableHead>
                  <TableHead>근무시간</TableHead>
                  <TableHead>메모</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                      스케줄이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.slice(0, 7).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{formatDate(s.date)}</TableCell>
                      <TableCell>{s.startTime}</TableCell>
                      <TableCell>{s.endTime}</TableCell>
                      <TableCell>{s.breakMinutes}분</TableCell>
                      <TableCell className="font-medium">{s.workHours}시간</TableCell>
                      <TableCell className="text-muted-foreground">{s.memo || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>최근 출퇴근 기록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>날짜</TableHead>
                  <TableHead>출근</TableHead>
                  <TableHead>퇴근</TableHead>
                  <TableHead>예정출근</TableHead>
                  <TableHead>예정퇴근</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>초과</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-16 text-center text-muted-foreground">
                      출퇴근 기록이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance.slice(-10).reverse().map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{formatDate(a.date)}</TableCell>
                      <TableCell>{a.checkIn ?? '-'}</TableCell>
                      <TableCell>{a.checkOut ?? '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{a.scheduledIn}</TableCell>
                      <TableCell className="text-muted-foreground">{a.scheduledOut}</TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} statusMap={ATTENDANCE_STATUS_MAP} />
                      </TableCell>
                      <TableCell>
                        {a.overtimeHours > 0 ? (
                          <span className="font-medium text-blue-600">{a.overtimeHours}h</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
