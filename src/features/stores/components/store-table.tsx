'use client';

import Link from 'next/link';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { STORE_STATUS_MAP, ROUTES } from '@/constants';
import { Badge } from '@/components/ui/badge';
import type { StoreWithOwner } from '../types';

interface StoreTableProps {
  stores: StoreWithOwner[];
  onDelete: (id: string) => void;
}

export function StoreTable({ stores, onDelete }: StoreTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">매장명</TableHead>
            <TableHead>주소</TableHead>
            <TableHead className="w-[120px]">연락처</TableHead>
            <TableHead className="w-[100px]">상태</TableHead>
            <TableHead className="w-[100px]">점주</TableHead>
            <TableHead className="w-[120px]">오픈일</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                등록된 매장이 없습니다
              </TableCell>
            </TableRow>
          ) : (
            stores.map((store) => {
              const statusInfo = STORE_STATUS_MAP[store.status];
              return (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={ROUTES.storeDetail(store.id)}
                      className="text-primary hover:underline"
                    >
                      {store.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{store.address}</TableCell>
                  <TableCell className="text-muted-foreground">{store.phone ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {store.owner_name ?? '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {store.opening_date ?? '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={ROUTES.storeDetail(store.id)} className="flex items-center gap-2">
                            <Eye size={14} /> 상세 보기
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={ROUTES.storeEdit(store.id)} className="flex items-center gap-2">
                            <Pencil size={14} /> 수정
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive"
                          onClick={() => onDelete(store.id)}
                        >
                          <Trash2 size={14} /> 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
