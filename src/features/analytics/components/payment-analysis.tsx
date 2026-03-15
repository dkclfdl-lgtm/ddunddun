'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/format';
import { CHART_COLORS } from '@/constants';
import type { ExcelProductData, CategorySummary } from '../types';

interface PaymentAnalysisProps {
  data: ExcelProductData[];
  categories: CategorySummary[];
}

const PAYMENT_COLORS = [
  CHART_COLORS[0], // cash
  CHART_COLORS[1], // card
  CHART_COLORS[2], // credit
  CHART_COLORS[3], // coupon
  CHART_COLORS[4], // agency
];

export function PaymentAnalysis({ data, categories }: PaymentAnalysisProps) {
  const overallPayment = useMemo(() => {
    const totalCash = data.reduce((s, p) => s + p.cashPayment, 0);
    const totalCard = data.reduce((s, p) => s + p.cardPayment, 0);
    const totalCredit = data.reduce((s, p) => s + p.creditPayment, 0);
    const totalCoupon = data.reduce((s, p) => s + p.couponPayment, 0);
    const totalAgency = data.reduce((s, p) => s + p.agencyPayment, 0);
    const total = totalCash + totalCard + totalCredit + totalCoupon + totalAgency;

    return [
      { name: '현금', value: totalCash, ratio: total > 0 ? (totalCash / total) * 100 : 0 },
      { name: '카드', value: totalCard, ratio: total > 0 ? (totalCard / total) * 100 : 0 },
      { name: '외상', value: totalCredit, ratio: total > 0 ? (totalCredit / total) * 100 : 0 },
      { name: '쿠폰', value: totalCoupon, ratio: total > 0 ? (totalCoupon / total) * 100 : 0 },
      { name: '대행', value: totalAgency, ratio: total > 0 ? (totalAgency / total) * 100 : 0 },
    ].filter((p) => p.value > 0);
  }, [data]);

  const categoryPayment = useMemo(() => {
    return categories
      .filter((c) => c.totalSalesAmount > 0)
      .sort((a, b) => b.totalSalesAmount - a.totalSalesAmount)
      .slice(0, 12)
      .map((cat) => {
        const products = data.filter((p) => p.categoryName === cat.categoryName);
        return {
          categoryName: cat.categoryName,
          현금: products.reduce((s, p) => s + p.cashPayment, 0),
          카드: products.reduce((s, p) => s + p.cardPayment, 0),
          쿠폰: products.reduce((s, p) => s + p.couponPayment, 0),
        };
      });
  }, [data, categories]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">결제 수단 비율</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallPayment}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={(props) => {
                    const p = props as unknown as { name?: string; ratio?: number };
                    const r = p.ratio ?? 0;
                    return r > 3 ? `${p.name ?? ''} ${formatPercent(r)}` : '';
                  }}
                  labelLine={false}
                >
                  {overallPayment.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {overallPayment.map((method, i) => (
              <div key={method.name || i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PAYMENT_COLORS[i] }}
                  />
                  <span>{method.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{formatCurrency(method.value)}</span>
                  <span className="text-muted-foreground ml-2">({formatPercent(method.ratio)})</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">카테고리별 결제 수단</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryPayment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryName" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tickFormatter={(v: number) => `${Math.floor(v / 10000)}만`} />
                <Tooltip formatter={(value, name) => [formatCurrency(Number(value)), String(name)]} />
                <Legend />
                <Bar dataKey="카드" stackId="payment" fill={PAYMENT_COLORS[1]} />
                <Bar dataKey="현금" stackId="payment" fill={PAYMENT_COLORS[0]} />
                <Bar dataKey="쿠폰" stackId="payment" fill={PAYMENT_COLORS[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
