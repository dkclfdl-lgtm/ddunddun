'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useMenuCategories, useMenuForm } from '@/features/menu/hooks';
import { MenuItemForm } from '@/features/menu/components/menu-item-form';

export default function NewMenuItemPage() {
  const { categories } = useMenuCategories();
  const { defaultValues, isSubmitting, submitItem, isEditing } = useMenuForm();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.menu}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">메뉴 등록</h1>
          <p className="mt-1 text-sm text-muted-foreground">새로운 메뉴를 등록합니다</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <MenuItemForm
          categories={categories}
          defaultValues={defaultValues}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
          onSubmit={submitItem}
        />
      </div>
    </div>
  );
}
