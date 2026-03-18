'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem, CostSimulation } from './types';

interface CostAnalysisStore {
  menuItems: MenuItem[];
  fileName: string | null;
  uploadedAt: string | null;
  selectedMenuId: string | null;
  // Simulation state shared across tabs
  simulations: CostSimulation[];
  setData: (items: MenuItem[], fileName: string) => void;
  clearData: () => void;
  selectMenu: (id: string | null) => void;
  setSimulations: (sims: CostSimulation[]) => void;
  addSimulation: (sim: CostSimulation) => void;
  clearSimulations: () => void;
}

export const useCostAnalysisStore = create<CostAnalysisStore>()(
  persist(
    (set) => ({
      menuItems: [],
      fileName: null,
      uploadedAt: null,
      selectedMenuId: null,
      simulations: [],
      setData: (items, fileName) =>
        set({
          menuItems: items,
          fileName,
          uploadedAt: new Date().toISOString(),
          selectedMenuId: null,
          simulations: [],
        }),
      clearData: () =>
        set({
          menuItems: [],
          fileName: null,
          uploadedAt: null,
          selectedMenuId: null,
          simulations: [],
        }),
      selectMenu: (id) => set({ selectedMenuId: id }),
      setSimulations: (sims) => set({ simulations: sims }),
      addSimulation: (sim) =>
        set((state) => {
          const existing = state.simulations.filter(
            (s) => s.menuItemId !== sim.menuItemId
          );
          return { simulations: [...existing, sim] };
        }),
      clearSimulations: () => set({ simulations: [] }),
    }),
    { name: 'ddunddun-cost-analysis' }
  )
);
