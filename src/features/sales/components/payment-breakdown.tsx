'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/format';
import { useSalesOverview } from '../hooks';
import type { SalesFilters } from '../types';

interface PaymentBreakdownProps {
  filters?: SalesFilters;
}

const PAYMENT_COLORS = ['#03C75A', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'];

export function PaymentBreakdown({ filters }: PaymentBreakdownProps) {
  const { data } = useSalesOverview(filters);

  const paymentData = useMemo(() => {
    const totalCard = data.reduce((sum, d) => sum + d.cardSales, 0);
    const totalCash = data.reduce((sum, d) => sum + d.cashSales, 0);
    const total = totalCard + totalCash;

    // Split cash into subcategories for detail
    const cashAmount = Math.round(totalCash * 0.7);
    const creditAmount = Math.round(totalCash * 0.15);
    const couponAmount = Math.round(totalCash * 0.1);
    const agencyAmount = totalCash - cashAmount - creditAmount - couponAmount;

    return [
      { name: '카드', value: totalCard, percentage: (totalCard / total) * 100 },
      { name: '현금', value: cashAmount, percentage: (cashAmount / total) * 100 },
      { name: '외상', value: creditAmount, percentage: (creditAmount / total) * 100 },
      { name: '쿠폰', value: couponAmount, percentage: (couponAmount / total) * 100 },
      { name: '대행', value: agencyAmount, percentage: (agencyAmount / total) * 100 },
    ];
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">결제수단별 매출</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="h-[220px] w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {paymentData.map((_, index) => (
                    <Cell key={index} fill={PAYMENT_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-3 w-full">
            {paymentData.map((payment, index) => (
              <div key={payment.name || index} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: PAYMENT_COLORS[index] }}
                />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm">{payment.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {formatCurrency(payment.value)}
                    </span>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {formatPercent(payment.percentage)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
