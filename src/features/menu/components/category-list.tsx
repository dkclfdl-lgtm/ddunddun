'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/common';
import type { MenuCategory, CategoryFormData } from '../types';
import { CategoryForm } from './category-form';

interface CategoryListProps {
  categories: MenuCategory[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onCreate: (data: CategoryFormData) => void;
  onUpdate: (id: string, data: Partial<CategoryFormData>) => void;
  onDelete: (id: string) => boolean;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function CategoryList({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onReorder,
  onCreate,
  onUpdate,
  onDelete,
  onToggleActive,
}: CategoryListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuCategory | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...categories];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    onReorder(items.map((c) => c.id));
  };

  const handleMoveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const items = [...categories];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    onReorder(items.map((c) => c.id));
  };

  const handleEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      onUpdate(editingCategory.id, data);
    } else {
      onCreate(data);
    }
    setFormOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const success = onDelete(deleteTarget.id);
    if (!success) {
      setDeleteError('해당 카테고리에 메뉴가 있어 삭제할 수 없습니다.');
    } else {
      setDeleteTarget(null);
      setDeleteError('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold text-foreground">카테고리</h3>
        <Button variant="ghost" size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          추가
        </Button>
      </div>

      <button
        type="button"
        className={cn(
          'flex items-center justify-between px-4 py-2.5 text-sm border-b hover:bg-muted/50 transition-colors',
          (!selectedCategoryId || selectedCategoryId === 'all') && 'bg-muted font-medium'
        )}
        onClick={() => onSelectCategory('all')}
      >
        <span>전체</span>
        <Badge variant="secondary" className="text-xs">
          {categories.reduce((sum, c) => sum + c.itemCount, 0)}
        </Badge>
      </button>

      <div className="flex-1 overflow-y-auto">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className={cn(
              'group flex items-center gap-2 px-2 py-2 border-b text-sm hover:bg-muted/50 transition-colors',
              selectedCategoryId === category.id && 'bg-muted font-medium',
              !category.isActive && 'opacity-50'
            )}
          >
            <div className="flex flex-col shrink-0">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
              >
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                onClick={() => handleMoveDown(index)}
                disabled={index === categories.length - 1}
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            <button
              type="button"
              className="flex-1 text-left truncate"
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name}
              <span className="ml-1 text-xs text-muted-foreground">
                ({category.code})
              </span>
            </button>

            <Badge variant="secondary" className="text-xs shrink-0">
              {category.itemCount}
            </Badge>

            <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
              <Switch
                checked={category.isActive}
                onCheckedChange={(checked) => onToggleActive(category.id, checked)}
                className="scale-75"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(category);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(category);
                  setDeleteError('');
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        category={editingCategory}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError('');
          }
        }}
        title="카테고리 삭제"
        description={
          deleteError ||
          `"${deleteTarget?.name}" 카테고리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
        }
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="삭제"
      />
    </div>
  );
}
