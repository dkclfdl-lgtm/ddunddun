'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants';
import { useMenuCategories } from '@/features/menu/hooks';
import { CategoryList } from '@/features/menu/components/category-list';

export default function CategoriesPage() {
  const {
    categories,
    activeCount,
    totalItems,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    toggleActive,
  } = useMenuCategories();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href={ROUTES.menu}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">카테고리 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            메뉴 카테고리를 추가, 수정, 삭제하고 순서를 변경하세요
          </p>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">전체 카테고리</p>
            <p className="text-2xl font-bold">{categories.length}개</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">활성 카테고리</p>
            <p className="text-2xl font-bold text-green-600">{activeCount}개</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">전체 메뉴수</p>
            <p className="text-2xl font-bold">{totalItems}개</p>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            카테고리 목록
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              드래그하여 순서를 변경할 수 있습니다
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[400px]">
            <CategoryList
              categories={categories}
              onSelectCategory={() => {}}
              onReorder={reorderCategories}
              onCreate={createCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
              onToggleActive={toggleActive}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
