'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/format';
import type { InspectionTemplate, InspectionCategory } from '../types';

const categoryColorMap: Record<InspectionCategory, string> = {
  '위생': 'bg-green-100 text-green-700 border-transparent',
  '서비스': 'bg-blue-100 text-blue-700 border-transparent',
  '시설': 'bg-orange-100 text-orange-700 border-transparent',
  '안전': 'bg-red-100 text-red-700 border-transparent',
};

interface InspectionTemplateListProps {
  templates: InspectionTemplate[];
}

export function InspectionTemplateList({ templates }: InspectionTemplateListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => {
        const categoryGroups = template.items.reduce<Record<string, number>>((acc, item) => {
          acc[item.category] = (acc[item.category] ?? 0) + 1;
          return acc;
        }, {});

        return (
          <Card key={template.id} className="border-border hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ClipboardList size={18} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">{template.description}</p>
                  </div>
                </div>
                {template.isActive ? (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 size={14} />
                    <span>활성</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <XCircle size={14} />
                    <span>비활성</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">총 항목 수</span>
                  <span className="font-medium">{template.items.length}개</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">만점</span>
                  <span className="font-medium">{template.maxScore}점</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">생성일</span>
                  <span className="font-medium">{formatDate(template.createdAt)}</span>
                </div>
                <div className="border-t pt-3">
                  <p className="mb-2 text-xs text-muted-foreground">카테고리별 항목</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(categoryGroups).map(([cat, count]) => (
                      <Badge
                        key={cat}
                        variant="outline"
                        className={categoryColorMap[cat as InspectionCategory]}
                      >
                        {cat} {count}개
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
