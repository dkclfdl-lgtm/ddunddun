'use client';

import Link from 'next/link';
import { ArrowLeft, Pencil, Star, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';
import { ROUTES } from '@/constants';
import type { MenuItem } from '../types';

interface MenuItemDetailProps {
  item: MenuItem;
  averageDailyRevenue: number;
}

export function MenuItemDetail({ item, averageDailyRevenue }: MenuItemDetailProps) {
  const marginRate =
    item.price > 0
      ? Math.round(((item.price - item.costPrice) / item.price) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.menu}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{item.name}</h1>
              {item.isPopular && (
                <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
                  <Star className="h-3 w-3 mr-0.5 fill-current" />
                  인기
                </Badge>
              )}
              <Badge
                variant={item.isAvailable ? 'default' : 'destructive'}
                className={item.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
              >
                {item.isAvailable ? '판매중' : '품절'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.categoryName} / {item.code}
            </p>
          </div>
        </div>
        <Link href={ROUTES.menuItemEdit(item.id)}>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-1.5" />
            수정
          </Button>
        </Link>
      </div>

      {/* 판매 통계 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 판매량</p>
                <p className="text-xl font-bold">{formatNumber(item.salesCount)}건</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 매출</p>
                <p className="text-xl font-bold">{formatCurrency(item.revenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">평균 일매출</p>
                <p className="text-xl font-bold">{formatCurrency(averageDailyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 상품 이미지 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">상품 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  이미지 없음
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 상품 정보 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">상품 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">상품명</p>
                <p className="font-medium">{item.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">상품코드</p>
                <p className="font-medium font-mono">{item.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">카테고리</p>
                <p className="font-medium">{item.categoryName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">바코드</p>
                <p className="font-medium font-mono">{item.barcode ?? '-'}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-1">설명</p>
              <p className="text-sm">{item.description || '-'}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">판매가</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(item.price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">원가</p>
                <p className="text-lg font-medium">{formatCurrency(item.costPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">마진율</p>
                <p className="text-lg font-medium text-green-600">{marginRate}%</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">등록일</p>
                <p className="text-sm">{formatDate(item.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">최종 수정일</p>
                <p className="text-sm">{formatDate(item.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
