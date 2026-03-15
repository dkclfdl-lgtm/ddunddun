'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KeywordCloudProps {
  keywords: { keyword: string; count: number; sentiment: string }[];
}

const sentimentStyles: Record<string, string> = {
  positive: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  neutral: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
  negative: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
};

export function KeywordCloud({ keywords }: KeywordCloudProps) {
  const sortedKeywords = [...keywords].sort((a, b) => b.count - a.count);
  const maxCount = sortedKeywords.length > 0 ? sortedKeywords[0].count : 1;

  function getFontSize(count: number): string {
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'text-base font-semibold';
    if (ratio > 0.4) return 'text-sm font-medium';
    return 'text-xs';
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">주요 키워드</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {sortedKeywords.map((kw) => (
            <span
              key={kw.keyword}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-3 py-1 transition-colors cursor-default',
                getFontSize(kw.count),
                sentimentStyles[kw.sentiment] ?? sentimentStyles.neutral,
              )}
            >
              {kw.keyword}
              <span className="text-[10px] opacity-60">({kw.count})</span>
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            긍정
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
            중립
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            부정
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
