export type WidgetType = 'card' | 'table' | 'chart';

export type ChartType = 'line' | 'candle';

export type FieldFormat = 'none' | 'currency' | 'percentage' | 'number' | 'compact';

export interface WidgetField {
  path: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  sampleValue?: any;
  format?: FieldFormat;
}

export interface WidgetConfig {
  id: string;
  name: string;
  description?: string;
  type: WidgetType;
  apiUrl: string;
  refreshInterval: number; // in seconds
  fields: WidgetField[];
  displayMode?: 'card' | 'table' | 'chart';
  chartType?: ChartType;
  chartInterval?: 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
  lastUpdated?: Date;
}

export interface ApiTestResult {
  success: boolean;
  data?: any;
  fields?: WidgetField[];
  error?: string;
}

export interface DashboardState {
  widgets: WidgetConfig[];
  theme: 'light' | 'dark';
  addWidget: (widget: WidgetConfig) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  reorderWidgets: (widgetIds: string[]) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}
