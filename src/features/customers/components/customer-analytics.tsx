'use client';

import { Users, UserPlus, RotateCcw, Clock, CreditCard, UserCheck, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatPercent, formatCurrency } from '@/lib/format';
import type { CustomerAnalytics as CustomerAnalyticsType } from '../types';
import { mockMonthlyCustomers, mockMemberSalesData, mockCustomerAgeGroups } from '../mock';

interface CustomerAnalyticsProps {
  analytics: CustomerAnalyticsType;
}

const MEMBER_COLORS = ['#03C75A', '#E5E8EB'];

export function CustomerAnalyticsSection({ analytics }: CustomerAnalyticsProps) {
  const kpis = [
    {
      title: '총 고객 수',
      value: `${formatNumber(analytics.totalCustomers)}명`,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: '신규 고객 (이번 달)',
      value: `${formatNumber(analytics.newCustomers)}명`,
      icon: UserPlus,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: '재방문율',
      value: formatPercent(analytics.returningRate),
      icon: RotateCcw,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: '평균 방문 주기',
      value: `${analytics.avgVisitFrequency}회/월`,
      icon: Clock,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      title: '평균 객단가',
      value: formatCurrency(analytics.avgSpendPerVisit),
      icon: CreditCard,
      color: 'text-cyan-600 bg-cyan-100',
    },
    {
      title: '회원 수',
      value: `${formatNumber(analytics.memberCount)}명`,
      icon: UserCheck,
      color: 'text-indigo-600 bg-indigo-100',
    },
    {
      title: '회원 매출 비율',
      value: formatPercent(analytics.memberSalesRatio),
      icon: TrendingUp,
      color: 'text-pink-600 bg-pink-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                    <p className="mt-1 text-lg font-bold">{kpi.value}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${kpi.color}`}>
                    <Icon size={18} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 월별 고객 추이 */}
        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">월별 고객 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockMonthlyCustomers} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value, name) => {
                      const labels: Record<string, string> = {
                        newCustomers: '신규 고객',
                        returning: '재방문 고객',
                      };
                      return [`${formatNumber(Number(value))}명`, labels[String(name)] ?? name];
                    }}
                  />
                  <Legend
                    formatter={(value: string) => {
                      const labels: Record<string, string> = {
                        newCustomers: '신규 고객',
                        returning: '재방문 고객',
                      };
                      return labels[value] ?? value;
                    }}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="newCustomers" fill="#03C75A" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="returning" fill="#1A73E8" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 회원/비회원 매출 비율 */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">회원 vs 비회원 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockMemberSalesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                    labelLine={false}
                  >
                    {mockMemberSalesData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={MEMBER_COLORS[index % MEMBER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, '비율']}
                    contentStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 연령대별 분포 */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">연령대별 고객 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {mockCustomerAgeGroups.map((group) => (
              <div key={group.group} className="text-center">
                <div className="mx-auto mb-2 h-20 w-full max-w-[80px] rounded-lg bg-muted overflow-hidden flex items-end">
                  <div
                    className="w-full rounded-t-sm bg-primary transition-all duration-500"
                    style={{ height: `${group.ratio * 3}px` }}
                  />
                </div>
                <p className="text-sm font-medium">{group.group}</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(group.count)}명 ({group.ratio}%)
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
