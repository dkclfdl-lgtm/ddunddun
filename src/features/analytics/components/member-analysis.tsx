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
import { Users, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { CHART_COLORS } from '@/constants';
import type { ExcelProductData } from '../types';

interface MemberAnalysisProps {
  data: ExcelProductData[];
}

export function MemberAnalysis({ data }: MemberAnalysisProps) {
  const stats = useMemo(() => {
    const totalOrders = data.reduce((s, p) => s + p.orderCount, 0);
    const totalMemberOrders = data.reduce((s, p) => s + p.memberOrders, 0);
    const totalSales = data.reduce((s, p) => s + p.actualSalesAmount, 0);
    const totalMemberSales = data.reduce((s, p) => s + p.memberSalesAmount, 0);
    const nonMemberOrders = totalOrders - totalMemberOrders;
    const nonMemberSales = totalSales - totalMemberSales;
    const memberAvg = totalMemberOrders > 0 ? Math.floor(totalMemberSales / totalMemberOrders) : 0;
    const nonMemberAvg = nonMemberOrders > 0 ? Math.floor(nonMemberSales / nonMemberOrders) : 0;

    return {
      totalOrders,
      totalMemberOrders,
      nonMemberOrders,
      totalSales,
      totalMemberSales,
      nonMemberSales,
      memberAvg,
      nonMemberAvg,
      memberOrderRatio: totalOrders > 0 ? (totalMemberOrders / totalOrders) * 100 : 0,
      memberSalesRatio: totalSales > 0 ? (totalMemberSales / totalSales) * 100 : 0,
    };
  }, [data]);

  const pieData = useMemo(() => [
    { name: '회원', value: stats.totalMemberSales },
    { name: '비회원', value: stats.nonMemberSales },
  ], [stats]);

  const comparisonData = useMemo(() => [
    { metric: '주문수', 회원: stats.totalMemberOrders, 비회원: stats.nonMemberOrders },
    { metric: '평균 객단가', 회원: stats.memberAvg, 비회원: stats.nonMemberAvg },
  ], [stats]);

  const categoryMemberData = useMemo(() => {
    const catMap = new Map<string, { member: number; nonMember: number }>();
    data.forEach((p) => {
      const existing = catMap.get(p.categoryName) ?? { member: 0, nonMember: 0 };
      existing.member += p.memberSalesAmount;
      existing.nonMember += p.actualSalesAmount - p.memberSalesAmount;
      catMap.set(p.categoryName, existing);
    });
    return Array.from(catMap.entries())
      .map(([name, values]) => ({
        categoryName: name,
        회원: values.member,
        비회원: values.nonMember,
        ratio: (values.member + values.nonMember) > 0
          ? (values.member / (values.member + values.nonMember)) * 100
          : 0,
      }))
      .filter((c) => c.회원 + c.비회원 > 0)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 12);
  }, [data]);

  const MEMBER_COLORS = [CHART_COLORS[0], CHART_COLORS[5]];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">회원 주문 비율</p>
            <p className="text-xl font-bold">{formatPercent(stats.memberOrderRatio)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-xs text-muted-foreground">회원 매출 비율</p>
            <p className="text-xl font-bold">{formatPercent(stats.memberSalesRatio)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">회원 평균 객단가</p>
            <p className="text-xl font-bold">{formatCurrency(stats.memberAvg)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">비회원 평균 객단가</p>
            <p className="text-xl font-bold">{formatCurrency(stats.nonMemberAvg)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">회원/비회원 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="value"
                    label={(props) => {
                      const p = props as unknown as { name?: string; value?: number };
                      return `${p.name ?? ''} ${formatCurrency(p.value ?? 0)}`;
                    }}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={MEMBER_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">주문수 / 객단가 비교</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis tickFormatter={(v: number) => v > 10000 ? `${Math.floor(v / 10000)}만` : formatNumber(v)} />
                  <Tooltip
                    formatter={(value, name) => [
                      Number(value) > 10000 ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                      String(name),
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="회원" fill={MEMBER_COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="비회원" fill={MEMBER_COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Member Contribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">카테고리별 회원 기여율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoryMemberData.map((cat, idx) => (
                <div key={cat.categoryName || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{cat.categoryName}</span>
                    <span className="font-medium">{formatPercent(cat.ratio)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-l-full"
                      style={{
                        width: `${cat.ratio}%`,
                        backgroundColor: MEMBER_COLORS[0],
                      }}
                    />
                    <div
                      className="h-full rounded-r-full"
                      style={{
                        width: `${100 - cat.ratio}%`,
                        backgroundColor: MEMBER_COLORS[1],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
