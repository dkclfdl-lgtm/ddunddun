import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChecklistData, ChecklistItem, ChecklistSection } from './types';
import { getDefaultChecklistData } from './utils';

interface ChecklistStore {
  data: ChecklistData;
  activeTab: 'hq' | 'franchisee';
  activeSectionId: string | null;

  // Actions
  setData: (data: ChecklistData) => void;
  resetToDefault: () => void;
  setActiveTab: (tab: 'hq' | 'franchisee') => void;
  setActiveSectionId: (id: string | null) => void;

  // Item actions
  toggleItem: (sectionId: string, itemId: string) => void;
  addItem: (sectionId: string, item: Omit<ChecklistItem, 'id'>) => void;
  updateItem: (sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  removeItem: (sectionId: string, itemId: string) => void;

  // Section actions
  addSection: (section: Omit<ChecklistSection, 'progress' | 'total'>) => void;
  updateSection: (sectionId: string, updates: Partial<Pick<ChecklistSection, 'title' | 'icon'>>) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;

  // Meta
  setBrandName: (name: string) => void;
  setStoreName: (name: string) => void;
  setAssignee: (name: string) => void;
}

function updateSectionItems(
  sections: ChecklistSection[],
  sectionId: string,
  updater: (items: ChecklistItem[]) => ChecklistItem[],
): ChecklistSection[] {
  return sections.map((sec) => {
    if (sec.id !== sectionId) return sec;
    const items = updater(sec.items);
    return {
      ...sec,
      items,
      progress: items.filter((i) => i.checked).length,
      total: items.length,
    };
  });
}

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set) => ({
  data: getDefaultChecklistData(),
  activeTab: 'hq' as const,
  activeSectionId: null,

  setData: (data) => set({ data }),
  resetToDefault: () => set({ data: getDefaultChecklistData() }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveSectionId: (id) => set({ activeSectionId: id }),

  toggleItem: (sectionId, itemId) =>
    set((state) => ({
      data: {
        ...state.data,
        updatedAt: new Date().toISOString(),
        sections: updateSectionItems(state.data.sections, sectionId, (items) =>
          items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
        ),
      },
    })),

  addItem: (sectionId, item) =>
    set((state) => ({
      data: {
        ...state.data,
        updatedAt: new Date().toISOString(),
        sections: updateSectionItems(state.data.sections, sectionId, (items) => [
          ...items,
          { ...item, id: `cl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
        ]),
      },
    })),

  updateItem: (sectionId, itemId, updates) =>
    set((state) => ({
      data: {
        ...state.data,
        updatedAt: new Date().toISOString(),
        sections: updateSectionItems(state.data.sections, sectionId, (items) =>
          items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
        ),
      },
    })),

  removeItem: (sectionId, itemId) =>
    set((state) => ({
      data: {
        ...state.data,
        updatedAt: new Date().toISOString(),
        sections: updateSectionItems(state.data.sections, sectionId, (items) =>
          items.filter((i) => i.id !== itemId),
        ),
      },
    })),

  addSection: (section) =>
    set((state) => ({
      data: {
        ...state.data,
        updatedAt: new Date().toISOString(),
        sections: [
          ...state.data.sections,
          { ...section, progress: 0, total: section.items.length },
        ],
      },
    })),

  updateSection: (sectionId, updates) =>
    set((state) => ({
      data: {
        ...state.data,
        updatedAt: new Date().toISOString(),
        sections: state.data.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, ...updates } : sec,
        ),
      },
    })),

  removeSection: (sectionId) =>
    set((state) => ({
      data: {
        ...state.data,
        updatedAt: new Date().toISOString(),
        sections: state.data.sections.filter((sec) => sec.id !== sectionId),
      },
    })),

  reorderSections: (fromIndex, toIndex) =>
    set((state) => {
      const sections = [...state.data.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return {
        data: { ...state.data, updatedAt: new Date().toISOString(), sections },
      };
    }),

  setBrandName: (name) =>
    set((state) => ({ data: { ...state.data, brandName: name } })),
  setStoreName: (name) =>
    set((state) => ({ data: { ...state.data, storeName: name } })),
  setAssignee: (name) =>
    set((state) => ({ data: { ...state.data, assignee: name } })),
}),
    {
      name: 'ddunddun-checklist',
      version: 2,
      migrate: () => ({
        data: getDefaultChecklistData(),
        activeTab: 'hq' as const,
        activeSectionId: null,
      }),
    }
  )
);
