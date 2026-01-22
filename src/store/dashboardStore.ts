import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WidgetConfig, DashboardState } from '@/types/widget';

const STORAGE_KEY = 'finance-dashboard-state';

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: [],
      theme: 'dark',

      addWidget: (widget: WidgetConfig) => {
        set((state) => ({
          widgets: [...state.widgets, widget],
        }));
      },

      removeWidget: (id: string) => {
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        }));
      },

      updateWidget: (id: string, updates: Partial<WidgetConfig>) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates, lastUpdated: new Date() } : w
          ),
        }));
      },

      reorderWidgets: (widgetIds: string[]) => {
        const currentWidgets = get().widgets;
        const reordered = widgetIds
          .map((id) => currentWidgets.find((w) => w.id === id))
          .filter((w): w is WidgetConfig => w !== undefined);
        
        set({ widgets: reordered });
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        // Apply theme to document
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },

      loadFromStorage: () => {
        // Persist middleware handles this automatically
        // This function is kept for compatibility but does nothing
      },

      saveToStorage: () => {
        // Persist middleware handles this automatically
        // This function is kept for compatibility but does nothing
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        widgets: state.widgets.map((w) => ({
          ...w,
          createdAt: w.createdAt instanceof Date ? w.createdAt.toISOString() : w.createdAt,
          lastUpdated: w.lastUpdated instanceof Date ? w.lastUpdated.toISOString() : w.lastUpdated,
        })),
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.widgets) {
          // Restore Date objects
          state.widgets = state.widgets.map((w: any) => ({
            ...w,
            createdAt: w.createdAt ? (typeof w.createdAt === 'string' ? new Date(w.createdAt) : w.createdAt) : new Date(),
            lastUpdated: w.lastUpdated ? (typeof w.lastUpdated === 'string' ? new Date(w.lastUpdated) : w.lastUpdated) : undefined,
          }));
          
          // Apply theme
          if (typeof document !== 'undefined' && state.theme) {
            document.documentElement.classList.toggle('dark', state.theme === 'dark');
          }
        }
      },
    }
  )
);
