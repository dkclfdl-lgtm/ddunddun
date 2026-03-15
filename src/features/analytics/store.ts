'use client';

import { create } from 'zustand';
import type { ExcelProductData } from './types';

interface AnalyticsStore {
  uploadedData: ExcelProductData[];
  fileName: string | null;
  uploadedAt: string | null;
  setData: (data: ExcelProductData[], fileName: string) => void;
  clearData: () => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  uploadedData: [],
  fileName: null,
  uploadedAt: null,
  setData: (data, fileName) =>
    set({
      uploadedData: data,
      fileName,
      uploadedAt: new Date().toISOString(),
    }),
  clearData: () =>
    set({
      uploadedData: [],
      fileName: null,
      uploadedAt: null,
    }),
}));
