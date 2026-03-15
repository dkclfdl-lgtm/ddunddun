'use client';

import { useMemo } from 'react';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  XCircle,
  CreditCard,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import type { ExcelProductData } from '../types';

interface DataOverviewProps {
  data: ExcelProductData[];
}

interface KpiItem {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export function DataOverview({ data }: DataOverviewProps) {
  const kpis = useMemo<KpiItem[]>(() => {
    if (data.length === 0) return [];

    const totalProducts = data.length;
    const totalRevenue = data.reduce((s, p) => s + p.actualSalesAmount, 0);
    const totalOrders = data.reduce((s, p) => s + p.orderCount, 0);
    const avgOrderValue =
      totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0;
    const totalCancels = data.reduce((s, p) => s + p.cancelCount, 0);
    const cancelRate =
      totalOrders > 0 ? (totalCancels / totalOrders) * 100 : 0;
    const totalCard = data.reduce((s, p) => s + p.cardPayment, 0);
    const totalPayment = data.reduce((s, p) => s + p.paymentAmount, 0);
    const cardRate =
      totalPayment > 0 ? (totalCard / totalPayment) * 100 : 0;
    const categories = new Set(data.map((p) => p.categoryName));
    const salesDays = data[0]?.salesDays || 0;
    const dailyAvgRevenue =
      salesDays > 0 ? Math.floor(totalRevenue / salesDays) : 0;

    return [
      {
        title: '총 상품수',
        value: formatNumber(totalProducts),
        subValue: `${formatNumber(categories.size)}개 카테고리`,
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        title: '총 매출액',
        value: formatCurrency(totalRevenue),
        subValue: `일평균 ${formatCurrency(dailyAvgRevenue)}`,
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        title: '총 주문수',
        value: formatNumber(totalOrders),
        icon: ShoppingCart,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
      {
        title: '평균 객단가',
        value: formatCurrency(avgOrderValue),
        icon: Users,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      },
      {
        title: '총 취소율',
        value: formatPercent(cancelRate),
        subValue: `${formatNumber(totalCancels)}건`,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      },
      {
        title: '카드결제 비율',
        value: formatPercent(cardRate),
        icon: CreditCard,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
      },
      {
        title: '판매 기간',
        value: `${salesDays}일`,
        icon: Calendar,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
      },
      {
        title: '총 판매량',
        value: formatNumber(
          data.reduce((s, p) => s + p.salesQuantity, 0)
        ),
        icon: BarChart3,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
      },
    ];
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          데이터가 없습니다
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          엑셀 파일을 업로드하여 분석을 시작하세요
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {kpi.title}
                </p>
                <p className="text-lg font-bold">{kpi.value}</p>
                {kpi.subValue && (
                  <p className="text-xs text-muted-foreground">
                    {kpi.subValue}
                  </p>
                )}
              </div>
              <div className={`rounded-lg p-2 ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
