'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useMenuCategories, useMenuForm } from '@/features/menu/hooks';
import { MenuItemForm } from '@/features/menu/components/menu-item-form';

export default function EditMenuItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = use(params);
  const { categories } = useMenuCategories();
  const { defaultValues, isSubmitting, submitItem, isEditing } = useMenuForm(itemId);

  if (!isEditing) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">메뉴를 찾을 수 없습니다</p>
        <Link href={ROUTES.menu}>
          <Button variant="outline">메뉴 목록으로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.menuItemDetail(itemId)}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">메뉴 수정</h1>
          <p className="mt-1 text-sm text-muted-foreground">메뉴 정보를 수정합니다</p>
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
