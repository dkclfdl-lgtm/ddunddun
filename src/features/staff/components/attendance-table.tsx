'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';
import { useAttendance } from '../hooks';

const ATTENDANCE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  present: { label: '출근', color: 'bg-green-100 text-green-700' },
  late: { label: '지각', color: 'bg-yellow-100 text-yellow-700' },
  absent: { label: '결근', color: 'bg-red-100 text-red-700' },
  early_leave: { label: '조퇴', color: 'bg-orange-100 text-orange-700' },
  day_off: { label: '휴무', color: 'bg-gray-100 text-gray-500' },
};

const storeOptions = [
  { value: 'all', label: '전체 매장' },
  { value: 'store-1', label: '강남점' },
  { value: 'store-2', label: '홍대점' },
  { value: 'store-3', label: '명동점' },
  { value: 'store-4', label: '잠실점' },
  { value: 'store-5', label: '신촌점' },
];

export function AttendanceTable() {
  const [storeId, setStoreId] = useState('all');
  const { records, summary } = useAttendance(storeId);

  const groupedByStaff = useMemo(() => {
    const groups = new Map<string, { name: string; records: typeof records }>();

    for (const record of records) {
      if (!groups.has(record.staffId)) {
        groups.set(record.staffId, { name: record.staffName, records: [] });
      }
      groups.get(record.staffId)!.records.push(record);
    }

    return Array.from(groups.entries()).map(([staffId, data]) => {
      const present = data.records.filter((r) => r.status === 'present').length;
      const late = data.records.filter((r) => r.status === 'late').length;
      const absent = data.records.filter((r) => r.status === 'absent').length;
      const earlyLeave = data.records.filter((r) => r.status === 'early_leave').length;
      const dayOff = data.records.filter((r) => r.status === 'day_off').length;
      const overtime = data.records.reduce((sum, r) => sum + r.overtimeHours, 0);

      return {
        staffId,
        name: data.name,
        present,
        late,
        absent,
        earlyLeave,
        dayOff,
        overtime,
        total: data.records.length,
      };
    });
  }, [records]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>월간 출퇴근 현황</CardTitle>
          <Select value={storeId} onValueChange={setStoreId}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {storeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[
            { label: '출근', value: summary.present, color: 'text-green-600' },
            { label: '지각', value: summary.late, color: 'text-yellow-600' },
            { label: '결근', value: summary.absent, color: 'text-red-600' },
            { label: '조퇴', value: summary.earlyLeave, color: 'text-orange-600' },
            { label: '휴무', value: summary.dayOff, color: 'text-gray-500' },
            { label: '초과근무', value: `${summary.totalOvertime}h`, color: 'text-blue-600' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={cn('text-lg font-bold', item.color)}>
                {typeof item.value === 'number' ? formatNumber(item.value) : item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Staff Attendance Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>직원명</TableHead>
                <TableHead className="text-center">출근</TableHead>
                <TableHead className="text-center">지각</TableHead>
                <TableHead className="text-center">결근</TableHead>
                <TableHead className="text-center">조퇴</TableHead>
                <TableHead className="text-center">휴무</TableHead>
                <TableHead className="text-center">초과근무</TableHead>
                <TableHead className="text-center">출근율</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedByStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    데이터가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                groupedByStaff.map((row) => {
                  const workDays = row.total - row.dayOff;
                  const attendanceRate = workDays > 0 ? Math.round((row.present / workDays) * 100) : 0;

                  return (
                    <TableRow key={row.staffId}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-transparent bg-green-100 text-green-700">
                          {row.present}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {row.late > 0 ? (
                          <Badge variant="outline" className="border-transparent bg-yellow-100 text-yellow-700">
                            {row.late}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.absent > 0 ? (
                          <Badge variant="outline" className="border-transparent bg-red-100 text-red-700">
                            {row.absent}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.earlyLeave > 0 ? (
                          <Badge variant="outline" className="border-transparent bg-orange-100 text-orange-700">
                            {row.earlyLeave}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {row.dayOff}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.overtime > 0 ? (
                          <span className="font-medium text-blue-600">{row.overtime}h</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            'font-medium',
                            attendanceRate >= 90 ? 'text-green-600' : attendanceRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                          )}
                        >
                          {attendanceRate}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
