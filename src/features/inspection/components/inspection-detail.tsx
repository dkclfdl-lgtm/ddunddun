'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatDate } from '@/lib/format';
import type { Inspection, InspectionItem, InspectionGrade } from '../types';
import { InspectionScoreGauge } from './inspection-score-gauge';
import { InspectionIssues } from './inspection-issues';

const gradeColorMap: Record<InspectionGrade, string> = {
  A: 'bg-green-100 text-green-700 border-transparent',
  B: 'bg-blue-100 text-blue-700 border-transparent',
  C: 'bg-yellow-100 text-yellow-700 border-transparent',
  D: 'bg-orange-100 text-orange-700 border-transparent',
  F: 'bg-red-100 text-red-700 border-transparent',
};

const statusLabels: Record<string, string> = {
  draft: '임시저장',
  completed: '완료',
  reviewed: '검토완료',
};

function getBarColor(percentage: number): string {
  if (percentage >= 80) return '#03C75A';
  if (percentage >= 60) return '#FFAA00';
  return '#FF4444';
}

interface InspectionDetailViewProps {
  inspection: Inspection;
  items: InspectionItem[];
}

export function InspectionDetailView({ inspection, items }: InspectionDetailViewProps) {
  const chartData = items.map((item) => ({
    name: item.itemName.length > 6 ? `${item.itemName.slice(0, 6)}...` : item.itemName,
    fullName: item.itemName,
    score: item.score,
    maxScore: item.maxScore,
    percentage: Math.round((item.score / item.maxScore) * 100),
  }));

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <InspectionScoreGauge
          score={inspection.totalScore}
          maxScore={inspection.maxScore}
        />
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">점검 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">매장</p>
                <p className="mt-0.5 font-medium">{inspection.storeName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">점검 템플릿</p>
                <p className="mt-0.5 font-medium">{inspection.templateName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">점검자</p>
                <p className="mt-0.5 font-medium">{inspection.inspectorName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">점검일</p>
                <p className="mt-0.5 font-medium">{formatDate(inspection.inspectionDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">등급</p>
                <Badge variant="outline" className={`mt-0.5 ${gradeColorMap[inspection.grade]}`}>
                  {inspection.grade}등급
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">상태</p>
                <p className="mt-0.5 font-medium">{statusLabels[inspection.status]}</p>
              </div>
            </div>
            {inspection.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-xs text-muted-foreground">비고</p>
                  <p className="mt-0.5 text-sm">{inspection.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 항목별 점수 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">항목별 점수</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, _name, props) => {
                    const payload = props.payload as Record<string, string | number>;
                    return [`${payload.score}/${payload.maxScore} (${value}%)`, String(payload.fullName)];
                  }}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={getBarColor(entry.percentage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 항목별 상세 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">항목별 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => {
              const pct = Math.round((item.score / item.maxScore) * 100);
              return (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-sm font-medium">{item.itemName}</span>
                    {item.notes && (
                      <span className="text-xs text-muted-foreground">- {item.notes}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: getBarColor(pct),
                        }}
                      />
                    </div>
                    <span className="w-20 text-right text-sm font-medium">
                      {item.score}/{item.maxScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 이슈 목록 */}
      {inspection.issues.length > 0 && (
        <InspectionIssues issues={inspection.issues} />
      )}
    </div>
  );
}
