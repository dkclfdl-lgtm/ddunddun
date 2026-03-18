'use client';

import { Check, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ChecklistItem as ChecklistItemType } from '../types';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  editMode?: boolean;
}

export function ChecklistItemRow({
  item,
  onToggle,
  onEdit,
  onDelete,
  editMode = false,
}: ChecklistItemProps) {
  const hasDetails = item.notes || item.guide || item.responsible;

  return (
    <div
      className={`group rounded-xl border-2 px-5 py-4 transition-all duration-200 cursor-pointer select-none ${
        item.checked
          ? 'border-green-200 bg-green-50/60 dark:border-green-900 dark:bg-green-950/30'
          : 'border-border bg-background hover:border-primary/30 hover:bg-accent/40'
      }`}
      onClick={(e) => {
        // Don't toggle if clicking edit/delete buttons
        if ((e.target as HTMLElement).closest('[data-edit-action]')) return;
        onToggle();
      }}
    >
      <div className="flex items-start gap-4">
        {/* Custom checkbox with animation */}
        <div
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-300 ${
            item.checked
              ? 'border-green-500 bg-green-500 scale-110'
              : 'border-muted-foreground/40 bg-background hover:border-primary'
          }`}
        >
          {item.checked && (
            <Check
              size={16}
              className="text-white animate-in zoom-in-50 duration-200"
              strokeWidth={3}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`shrink-0 text-[10px] font-normal ${
                item.checked ? 'opacity-50' : ''
              }`}
            >
              {item.category}
            </Badge>
            <span
              className={`text-sm font-medium transition-all duration-200 ${
                item.checked
                  ? 'text-muted-foreground line-through decoration-green-400'
                  : 'text-foreground'
              }`}
            >
              {item.title}
            </span>
          </div>

          {/* Details - always visible */}
          {hasDetails && (
            <div className="space-y-1 border-l-2 border-muted pl-3">
              {item.responsible && (
                <p className={`text-xs ${item.checked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                  <span className="font-semibold text-foreground/70">담당자</span>{' '}
                  {item.responsible}
                </p>
              )}
              {item.notes && (
                <p className={`text-xs ${item.checked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                  <span className="font-semibold text-foreground/70">메모</span>{' '}
                  {item.notes}
                </p>
              )}
              {item.guide && (
                <p className={`text-xs ${item.checked ? 'text-muted-foreground/60' : 'text-blue-600 dark:text-blue-400'}`}>
                  <span className="font-semibold text-foreground/70">가이드</span>{' '}
                  {item.guide}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Edit/Delete buttons - only in edit mode */}
        {editMode && (
          <div className="flex shrink-0 items-center gap-1" data-edit-action>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                data-edit-action
              >
                <Pencil size={14} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                data-edit-action
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
