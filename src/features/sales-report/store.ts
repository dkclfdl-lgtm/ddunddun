'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SalesReportData } from './types';

interface SalesReportStore {
  reportData: SalesReportData | null;
  fileName: string | null;
  uploadedAt: string | null;
  setReportData: (data: SalesReportData, fileName: string) => void;
  clearData: () => void;
}

export const useSalesReportStore = create<SalesReportStore>()(
  persist(
    (set) => ({
      reportData: null,
      fileName: null,
      uploadedAt: null,
      setReportData: (data, fileName) =>
        set({
          reportData: data,
          fileName,
          uploadedAt: new Date().toISOString(),
        }),
      clearData: () =>
        set({
          reportData: null,
          fileName: null,
          uploadedAt: null,
        }),
    }),
    { name: 'ddunddun-sales-report' }
  )
);
