'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDashboardStore } from '@/store/dashboardStore';
import { WidgetConfig } from '@/types/widget';
import { WidgetCard } from './widgets/WidgetCard';
import { WidgetTable } from './widgets/WidgetTable';
import { WidgetChart } from './widgets/WidgetChart';
import { AddWidgetModal } from './AddWidgetModal';

interface SortableWidgetProps {
  widget: WidgetConfig;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({ widget, onEdit, onDelete, onRefresh }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderWidget = () => {
    switch (widget.type) {
      case 'card':
        return <WidgetCard widget={widget} onEdit={onEdit} onDelete={onDelete} onRefresh={onRefresh} />;
      case 'table':
        return <WidgetTable widget={widget} onEdit={onEdit} onDelete={onDelete} onRefresh={onRefresh} />;
      case 'chart':
        return <WidgetChart widget={widget} onEdit={onEdit} onDelete={onDelete} onRefresh={onRefresh} />;
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-move opacity-50 hover:opacity-100 transition-opacity"
        title="Drag to reorder"
      >
        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      {renderWidget()}
    </div>
  );
};

export const FinanceDashboard: React.FC = () => {
  const {
    widgets,
    theme,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
    setTheme,
    loadFromStorage,
  } = useDashboardStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadFromStorage();
    // Apply theme on mount
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [loadFromStorage, theme]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      reorderWidgets(newWidgets.map((w) => w.id));
    }
  };

  const handleAddWidget = (widgetData: Omit<WidgetConfig, 'id' | 'createdAt' | 'lastUpdated'>) => {
    if (editingWidget) {
      updateWidget(editingWidget.id, widgetData);
      setEditingWidget(null);
    } else {
      const newWidget: WidgetConfig = {
        ...widgetData,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };
      addWidget(newWidget);
    }
    setIsModalOpen(false);
  };

  const handleEditWidget = (widget: WidgetConfig) => {
    setEditingWidget(widget);
    setIsModalOpen(true);
  };

  const handleDeleteWidget = (id: string) => {
    if (confirm('Are you sure you want to delete this widget?')) {
      removeWidget(id);
    }
  };

  const handleRefreshWidget = (widget: WidgetConfig) => {
    // Force refresh by updating the widget (triggers re-fetch in widget components)
    updateWidget(widget.id, { ...widget });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      theme,
      widgets: widgets.map((w) => ({
        ...w,
        createdAt: w.createdAt instanceof Date ? w.createdAt.toISOString() : w.createdAt,
        lastUpdated: w.lastUpdated instanceof Date ? w.lastUpdated.toISOString() : w.lastUpdated,
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          
          if (!importedData.widgets || !Array.isArray(importedData.widgets)) {
            alert('Invalid dashboard file format');
            return;
          }

          if (confirm(`This will replace your current dashboard with ${importedData.widgets.length} widget(s). Continue?`)) {
            // Restore widgets with proper Date objects
            interface ImportedWidget {
              id?: string;
              name: string;
              description?: string;
              type: WidgetConfig['type'];
              apiUrl: string;
              refreshInterval: number;
              fields: WidgetConfig['fields'];
              displayMode?: WidgetConfig['displayMode'];
              chartType?: WidgetConfig['chartType'];
              chartInterval?: WidgetConfig['chartInterval'];
              createdAt?: string | Date;
              lastUpdated?: string | Date;
            }
            const restoredWidgets = (importedData.widgets as ImportedWidget[]).map((w) => ({
              ...w,
              id: w.id || `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: w.createdAt ? new Date(w.createdAt) : new Date(),
              lastUpdated: w.lastUpdated ? new Date(w.lastUpdated) : undefined,
            }));

            // Clear current widgets and add imported ones
            widgets.forEach((w) => removeWidget(w.id));
            restoredWidgets.forEach((w: WidgetConfig) => addWidget(w));

            // Restore theme if present
            if (importedData.theme) {
              setTheme(importedData.theme);
            }

            alert('Dashboard imported successfully!');
          }
        } catch (error) {
          console.error('Import error:', error);
          alert('Failed to import dashboard. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Finance Dashboard
                </h1>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {widgets.length} active widget{widgets.length !== 1 ? 's' : ''} • Real-time data
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Export dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button
                onClick={handleImport}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Import dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => {
                  setEditingWidget(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Widget
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Build Your Finance Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              Create custom widgets by connecting to any finance API. Track stocks, crypto, forex, or economic indicators - all in real-time.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Widget
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={widgets.map((w) => w.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {widgets.map((widget) => (
                  <SortableWidget
                    key={widget.id}
                    widget={widget}
                    onEdit={() => handleEditWidget(widget)}
                    onDelete={() => handleDeleteWidget(widget.id)}
                    onRefresh={() => handleRefreshWidget(widget)}
                  />
                ))}
                {/* Add Widget Placeholder */}
                <div
                  onClick={() => {
                    setEditingWidget(null);
                    setIsModalOpen(true);
                  }}
                  className="border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 dark:hover:border-green-600 transition-colors bg-green-50/50 dark:bg-green-900/10"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Add Widget
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Connect to a finance API and create a custom widget
                  </p>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWidget(null);
        }}
        onAdd={handleAddWidget}
        editingWidget={editingWidget}
      />
    </div>
  );
};
