'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { formatDate } from '@/lib/format';
import type { InspectionIssue, IssueSeverity } from '../types';

const severityConfig: Record<IssueSeverity, { label: string; color: string; icon: typeof AlertTriangle }> = {
  critical: { label: '심각', color: 'bg-red-100 text-red-700 border-transparent', icon: AlertTriangle },
  major: { label: '주요', color: 'bg-orange-100 text-orange-700 border-transparent', icon: AlertTriangle },
  minor: { label: '경미', color: 'bg-yellow-100 text-yellow-700 border-transparent', icon: Clock },
};

interface InspectionIssuesProps {
  issues: InspectionIssue[];
}

export function InspectionIssues({ issues }: InspectionIssuesProps) {
  const unresolvedCount = issues.filter((i) => !i.resolvedAt).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          이슈 목록
          {unresolvedCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              미해결 {unresolvedCount}건
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {issues.map((issue) => {
            const config = severityConfig[issue.severity];
            const Icon = config.icon;
            return (
              <div
                key={issue.id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div className="flex items-start gap-3">
                  <Icon size={18} className={issue.resolvedAt ? 'text-muted-foreground' : 'text-destructive'} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{issue.itemName}</span>
                      <Badge variant="outline" className={config.color}>
                        {config.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {issue.category}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {issue.resolvedAt ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 size={14} />
                      <span>해결 ({formatDate(issue.resolvedAt)})</span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                      미해결
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          {issues.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">발견된 이슈가 없습니다</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
