'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common';
import { ROUTES } from '@/constants';
import { formatDate } from '@/lib/format';
import type { Inspection, InspectionGrade, InspectionStatus } from '../types';

const gradeColorMap: Record<InspectionGrade, string> = {
  A: 'bg-green-100 text-green-700 border-transparent',
  B: 'bg-blue-100 text-blue-700 border-transparent',
  C: 'bg-yellow-100 text-yellow-700 border-transparent',
  D: 'bg-orange-100 text-orange-700 border-transparent',
  F: 'bg-red-100 text-red-700 border-transparent',
};

const statusMap: Record<InspectionStatus, { label: string; color: string }> = {
  draft: { label: '임시저장', color: 'bg-gray-100 text-gray-700 border-transparent' },
  completed: { label: '완료', color: 'bg-green-100 text-green-700 border-transparent' },
  reviewed: { label: '검토완료', color: 'bg-blue-100 text-blue-700 border-transparent' },
};

const columns: ColumnDef<Inspection>[] = [
  {
    accessorKey: 'inspectionDate',
    header: '점검일',
    cell: ({ row }) => formatDate(row.original.inspectionDate),
  },
  {
    accessorKey: 'storeName',
    header: '매장',
  },
  {
    accessorKey: 'templateName',
    header: '템플릿',
  },
  {
    accessorKey: 'inspectorName',
    header: '점검자',
  },
  {
    accessorKey: 'totalScore',
    header: '점수',
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.totalScore}/{row.original.maxScore} ({row.original.percentage}%)
      </span>
    ),
  },
  {
    accessorKey: 'grade',
    header: '등급',
    cell: ({ row }) => (
      <Badge variant="outline" className={gradeColorMap[row.original.grade]}>
        {row.original.grade}등급
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }) => {
      const config = statusMap[row.original.status];
      return (
        <Badge variant="outline" className={config.color}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Link href={ROUTES.inspectionDetail(row.original.id)}>
        <Button variant="ghost" size="sm">
          <Eye size={16} className="mr-1" />
          상세
        </Button>
      </Link>
    ),
  },
];

interface InspectionTableProps {
  inspections: Inspection[];
}

export function InspectionTable({ inspections }: InspectionTableProps) {
  return (
    <DataTable
      columns={columns}
      data={inspections}
      searchKey="storeName"
      searchPlaceholder="매장명으로 검색..."
    />
  );
}
