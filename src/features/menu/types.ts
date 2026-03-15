export interface MenuCategory {
  id: string;
  brandId: string;
  name: string;
  code: string;
  sortOrder: number;
  isActive: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  name: string;
  code: string;
  barcode: string | null;
  price: number;
  costPrice: number;
  description: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isPopular: boolean;
  sortOrder: number;
  salesCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuFormData {
  categoryId: string;
  name: string;
  code: string;
  price: number;
  costPrice: number;
  description: string;
  isAvailable: boolean;
  isPopular: boolean;
}

export interface CategoryFormData {
  name: string;
  code: string;
  isActive: boolean;
}

export interface MenuFilters {
  search: string;
  categoryId: string;
  isAvailable: boolean | null;
}

export type MenuViewMode = 'table' | 'grid';
