'use client';

import { Settings2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ColumnConfig } from '../types';

interface ColumnManagerProps {
  groups: {
    name: string;
    columns: ColumnConfig[];
    allVisible: boolean;
    someVisible: boolean;
  }[];
  onToggleColumn: (key: string) => void;
  onToggleGroup: (group: string, visible: boolean) => void;
  onReset: () => void;
  visibleCount: number;
  totalCount: number;
}

export function ColumnManager({
  groups,
  onToggleColumn,
  onToggleGroup,
  onReset,
  visibleCount,
  totalCount,
}: ColumnManagerProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            컬럼 관리
            <Badge variant="outline" className="text-xs">
              {visibleCount}/{totalCount}
            </Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onReset} className="text-xs h-7">
            <RotateCcw className="h-3 w-3 mr-1" />
            초기화
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {groups.map((group, idx) => (
              <div key={group.name || idx}>
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id={`group-${group.name}`}
                    checked={group.allVisible}
                    onCheckedChange={(checked) => {
                      onToggleGroup(group.name, !!checked);
                    }}
                  />
                  <label
                    htmlFor={`group-${group.name}`}
                    className="text-sm font-semibold cursor-pointer"
                  >
                    {group.name}
                  </label>
                  <Badge variant="outline" className="text-[10px]">
                    {group.columns.filter((c) => c.isVisible).length}/{group.columns.length}
                  </Badge>
                </div>
                <div className="ml-6 grid grid-cols-2 gap-x-4 gap-y-1">
                  {group.columns.map((col) => (
                    <div key={col.key} className="flex items-center gap-2">
                      <Checkbox
                        id={`col-${col.key}`}
                        checked={col.isVisible}
                        onCheckedChange={() => onToggleColumn(col.key)}
                      />
                      <label
                        htmlFor={`col-${col.key}`}
                        className="text-xs cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {col.label}
                      </label>
                    </div>
                  ))}
                </div>
                <Separator className="mt-3" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
