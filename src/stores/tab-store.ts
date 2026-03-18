'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TabItem {
  id: string;
  href: string;
  label: string;
}

interface TabState {
  tabs: TabItem[];
  activeTabId: string | null;
  addTab: (tab: TabItem) => void;
  removeTab: (tabId: string) => string | null;
  closeAllExceptThis: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (tabId: string) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,

      addTab: (tab: TabItem) => {
        const { tabs } = get();
        const existing = tabs.find((t) => t.id === tab.id);
        if (existing) {
          set({ activeTabId: tab.id });
          return;
        }
        set({
          tabs: [...tabs, tab],
          activeTabId: tab.id,
        });
      },

      removeTab: (tabId: string) => {
        const { tabs, activeTabId } = get();
        const index = tabs.findIndex((t) => t.id === tabId);
        const nextTabs = tabs.filter((t) => t.id !== tabId);

        let nextActiveId: string | null = activeTabId;
        if (activeTabId === tabId) {
          if (nextTabs.length === 0) {
            nextActiveId = null;
          } else if (index >= nextTabs.length) {
            nextActiveId = nextTabs[nextTabs.length - 1].id;
          } else {
            nextActiveId = nextTabs[index].id;
          }
        }

        set({ tabs: nextTabs, activeTabId: nextActiveId });
        return nextActiveId ? nextTabs.find((t) => t.id === nextActiveId)?.href ?? null : null;
      },

      closeAllExceptThis: (tabId: string) => {
        const { tabs } = get();
        const kept = tabs.filter((t) => t.id === tabId);
        set({ tabs: kept, activeTabId: tabId });
      },

      closeAllTabs: () => {
        set({ tabs: [], activeTabId: null });
      },

      setActiveTab: (tabId: string) => {
        set({ activeTabId: tabId });
      },
    }),
    {
      name: 'ddunddun-tabs',
    },
  ),
);
