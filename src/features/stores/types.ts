import type { Store, StoreStatus } from '@/types';

export interface StoreWithOwner extends Store {
  owner_name?: string;
  owner_email?: string;
}

export interface StoreFormData {
  name: string;
  address: string;
  phone: string;
  status: StoreStatus;
  opening_date: string;
  owner_id: string;
  lat: number | null;
  lng: number | null;
}

export interface StoreFilters {
  search: string;
  status: StoreStatus | 'all';
}

export type StoreViewMode = 'table' | 'grid';
