'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TemplateItem, InspectionCategory } from '../types';

const categoryColorMap: Record<InspectionCategory, string> = {
  '위생': 'bg-green-100 text-green-700 border-transparent',
  '서비스': 'bg-blue-100 text-blue-700 border-transparent',
  '시설': 'bg-orange-100 text-orange-700 border-transparent',
  '안전': 'bg-red-100 text-red-700 border-transparent',
};

interface InspectionChecklistProps {
  items: TemplateItem[];
  scores: Record<string, number>;
  notes: Record<string, string>;
  onScoreChange: (itemId: string, score: number) => void;
  onNotesChange: (itemId: string, notes: string) => void;
}

export function InspectionChecklist({
  items,
  scores,
  notes,
  onScoreChange,
  onNotesChange,
}: InspectionChecklistProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const groupedItems = items.reduce<Record<string, TemplateItem[]>>((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Badge variant="outline" className={categoryColorMap[category as InspectionCategory]}>
                {category}
              </Badge>
              <span>{categoryItems.length}개 항목</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryItems.map((item) => {
              const currentScore = scores[item.id] ?? 0;
              const isExpanded = expandedItems.has(item.id);
              return (
                <div key={item.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className="text-left"
                      >
                        <p className="font-medium">{item.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="range"
                        min={0}
                        max={item.maxScore}
                        step={1}
                        value={currentScore}
                        onChange={(e) => onScoreChange(item.id, Number(e.target.value))}
                        className="w-24 accent-primary"
                      />
                      <span className="w-16 text-right text-sm font-medium">
                        {currentScore} / {item.maxScore}
                      </span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 space-y-3 border-t pt-3">
                      <div>
                        <Label className="text-xs">메모</Label>
                        <Textarea
                          placeholder="점검 메모를 입력하세요..."
                          value={notes[item.id] ?? ''}
                          onChange={(e) => onNotesChange(item.id, e.target.value)}
                          className="mt-1 h-20"
                        />
                      </div>
                      <div>
                        <Button variant="outline" size="sm" type="button" disabled>
                          <ImagePlus size={14} className="mr-1" />
                          사진 첨부
                        </Button>
                        <span className="ml-2 text-xs text-muted-foreground">
                          (사진 첨부 기능은 준비 중입니다)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
