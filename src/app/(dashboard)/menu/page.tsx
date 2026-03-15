'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useMenuCategories, useMenuItems } from '@/features/menu/hooks';
import { CategoryList } from '@/features/menu/components/category-list';
import { MenuItemTable } from '@/features/menu/components/menu-item-table';
import { MenuItemCard } from '@/features/menu/components/menu-item-card';
import { MenuStats } from '@/features/menu/components/menu-stats';
import { MenuFiltersBar } from '@/features/menu/components/menu-filters';
import type { MenuFilters, MenuViewMode } from '@/features/menu/types';

export default function MenuPage() {
  const [filters, setFilters] = useState<MenuFilters>({
    search: '',
    categoryId: 'all',
    isAvailable: null,
  });
  const [viewMode, setViewMode] = useState<MenuViewMode>('table');

  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    toggleActive,
  } = useMenuCategories();

  const {
    items,
    stats,
    deleteItem,
    toggleAvailable,
    togglePopular,
  } = useMenuItems(filters);

  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setFilters((prev) => ({ ...prev, categoryId }));
  }, []);

  const handleAvailabilityChange = useCallback((isAvailable: boolean | null) => {
    setFilters((prev) => ({ ...prev, isAvailable }));
  }, []);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">메뉴 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            메뉴 카테고리와 상품을 관리하세요
          </p>
        </div>
        <Link href={ROUTES.menuItemNew}>
          <Button>
            <Plus className="h-4 w-4 mr-1.5" />
            메뉴 등록
          </Button>
        </Link>
      </div>

      {/* 통계 카드 */}
      <MenuStats
        total={stats.total}
        available={stats.available}
        unavailable={stats.unavailable}
        popular={stats.popular}
      />

      {/* 메인 컨텐츠 */}
      <div className="flex gap-6">
        {/* 카테고리 사이드바 */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-6 rounded-lg border bg-card shadow-sm max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
            <CategoryList
              categories={categories}
              selectedCategoryId={filters.categoryId}
              onSelectCategory={handleCategoryChange}
              onReorder={reorderCategories}
              onCreate={createCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
              onToggleActive={toggleActive}
            />
          </div>
        </div>

        {/* 메뉴 아이템 영역 */}
        <div className="flex-1 min-w-0 space-y-4">
          <MenuFiltersBar
            filters={filters}
            categories={categories}
            viewMode={viewMode}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onAvailabilityChange={handleAvailabilityChange}
            onViewModeChange={setViewMode}
          />

          {viewMode === 'table' ? (
            <MenuItemTable
              items={items}
              onToggleAvailable={toggleAvailable}
              onTogglePopular={togglePopular}
              onDelete={deleteItem}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onToggleAvailable={toggleAvailable}
                  onTogglePopular={togglePopular}
                />
              ))}
            </div>
          )}

          {items.length === 0 && (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
