'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { ChecklistSection as ChecklistSectionType, ChecklistItem } from '../types';
import { calcSectionProgress } from '../utils';
import { ChecklistItemRow } from './checklist-item';

interface ChecklistSectionProps {
  section: ChecklistSectionType;
  onToggleItem: (itemId: string) => void;
  onEditItem: (item: ChecklistItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: () => void;
  editMode?: boolean;
}

export function ChecklistSectionCard({
  section,
  onToggleItem,
  onEditItem,
  onDeleteItem,
  onAddItem,
  editMode = false,
}: ChecklistSectionProps) {
  const { progress, total, percent } = calcSectionProgress(section);

  // Group items by category
  const categories = new Map<string, ChecklistItem[]>();
  for (const item of section.items) {
    const cat = item.category || '기타';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(item);
  }

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground truncate">{section.title}</h3>
              <span className="shrink-0 text-sm text-muted-foreground font-medium">
                {progress}/{total}
              </span>
              <span className="shrink-0 text-sm font-bold text-primary">
                {Math.round(percent)}%
              </span>
            </div>
            <Progress value={percent} className="mt-2 h-2" />
          </div>
        </div>
      </div>

      {/* Items grouped by category */}
      <div className="space-y-6">
        {Array.from(categories.entries()).map(([cat, items]) => (
          <div key={cat}>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {cat}
            </p>
            <div className="space-y-2">
              {items.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onToggle={() => onToggleItem(item.id)}
                  onEdit={() => onEditItem(item)}
                  onDelete={() => onDeleteItem(item.id)}
                  editMode={editMode}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Add item button - only in edit mode */}
        {editMode && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onAddItem}
          >
            <Plus size={14} className="mr-1.5" />
            항목 추가
          </Button>
        )}
      </div>
    </div>
  );
}
