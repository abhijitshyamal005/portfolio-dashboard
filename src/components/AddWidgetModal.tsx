'use client';

import React, { useState, useEffect } from 'react';
import { WidgetConfig, WidgetType, WidgetField, ApiTestResult, FieldFormat } from '@/types/widget';
import { testApiEndpoint } from '@/services/widgetApi';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (widget: Omit<WidgetConfig, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  editingWidget?: WidgetConfig | null;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  editingWidget,
}) => {
  const [widgetName, setWidgetName] = useState('');
  const [widgetDescription, setWidgetDescription] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState<WidgetType>('card');
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [selectedFields, setSelectedFields] = useState<WidgetField[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [chartInterval, setChartInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    if (editingWidget) {
      setWidgetName(editingWidget.name);
      setWidgetDescription(editingWidget.description || '');
      setApiUrl(editingWidget.apiUrl);
      setRefreshInterval(editingWidget.refreshInterval);
      setDisplayMode(editingWidget.type);
      setSelectedFields(editingWidget.fields);
      setChartType(editingWidget.chartType || 'line');
      setChartInterval(editingWidget.chartInterval || 'daily');
    } else {
      resetForm();
    }
  }, [editingWidget, isOpen]);

  const resetForm = () => {
    setWidgetName('');
    setWidgetDescription('');
    setApiUrl('');
    setRefreshInterval(30);
    setDisplayMode('card');
    setTestResult(null);
    setSelectedFields([]);
    setSearchTerm('');
    setShowArraysOnly(false);
    setChartType('line');
    setChartInterval('daily');
  };

  const handleTest = async () => {
    if (!apiUrl.trim()) {
      setTestResult({
        success: false,
        error: 'Please enter an API URL',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testApiEndpoint(apiUrl);
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'Failed to test API',
      });
    } finally {
      setTesting(false);
    }
  };

  const toggleField = (field: WidgetField) => {
    if (selectedFields.some((f) => f.path === field.path)) {
      setSelectedFields(selectedFields.filter((f) => f.path !== field.path));
    } else {
      setSelectedFields([...selectedFields, { ...field, format: field.type === 'number' ? 'number' : 'none' }]);
    }
  };

  const updateFieldFormat = (path: string, format: FieldFormat) => {
    setSelectedFields(selectedFields.map((f) => 
      f.path === path ? { ...f, format } : f
    ));
  };

  const removeSelectedField = (path: string) => {
    setSelectedFields(selectedFields.filter((f) => f.path !== path));
  };

  const handleAdd = () => {
    if (!widgetName.trim()) {
      alert('Please enter a widget name');
      return;
    }

    if (!apiUrl.trim()) {
      alert('Please enter an API URL');
      return;
    }

    if (selectedFields.length === 0) {
      alert('Please select at least one field to display');
      return;
    }

    onAdd({
      name: widgetName,
      description: widgetDescription || undefined,
      apiUrl,
      refreshInterval,
      type: displayMode,
      fields: selectedFields,
      chartType: displayMode === 'chart' ? chartType : undefined,
      chartInterval: displayMode === 'chart' ? chartInterval : undefined,
    });

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const availableFields = testResult?.fields || [];
  const filteredFields = availableFields.filter((field) => {
    if (showArraysOnly && field.type !== 'array') return false;
    if (searchTerm) {
      return (
        field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.path.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingWidget ? 'Edit Widget' : 'Add New Widget'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Widget Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Widget Name
            </label>
            <input
              type="text"
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
              placeholder="e.g., Bitcoin Price Tracker"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Widget Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={widgetDescription}
              onChange={(e) => setWidgetDescription(e.target.value)}
              placeholder="Add a description for this widget..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* API URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="e.g., https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleTest}
                disabled={testing}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Test
                  </>
                )}
              </button>
            </div>
            {testResult && (
              <div className={`mt-2 p-3 rounded-lg ${
                testResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <p className={`text-sm ${
                  testResult.success
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {testResult.success
                    ? `API connection successful! ${testResult.fields?.length || 0} fields found.`
                    : testResult.error}
                </p>
              </div>
            )}
          </div>

          {/* Refresh Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Refresh Interval (seconds)
            </label>
            <input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Display Mode */}
          {testResult?.success && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Mode
              </label>
              <div className="flex gap-2">
                {(['card', 'table', 'chart'] as WidgetType[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDisplayMode(mode)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      displayMode === mode
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Chart Options */}
              {displayMode === 'chart' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Chart Type
                    </label>
                    <div className="flex gap-2">
                      {(['line', 'candle'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setChartType(type)}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            chartType === type
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Interval
                    </label>
                    <div className="flex gap-2">
                      {(['daily', 'weekly', 'monthly'] as const).map((interval) => (
                        <button
                          key={interval}
                          onClick={() => setChartInterval(interval)}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            chartInterval === interval
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {interval.charAt(0).toUpperCase() + interval.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Field Selection */}
          {testResult?.success && testResult.fields && testResult.fields.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Fields to Display
              </label>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search for fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={showArraysOnly}
                    onChange={(e) => setShowArraysOnly(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Show arrays only (for table view)
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Available Fields */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Available Fields
                  </h3>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                    {filteredFields.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No fields found
                      </p>
                    ) : (
                      filteredFields.map((field) => (
                        <div
                          key={field.path}
                          className={`p-2 rounded border cursor-pointer transition-colors ${
                            selectedFields.some((f) => f.path === field.path)
                              ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => toggleField(field)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {field.label}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {field.path}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {field.type} | {field.sampleValue !== undefined ? JSON.stringify(field.sampleValue).substring(0, 30) : 'N/A'}
                              </p>
                            </div>
                            {selectedFields.some((f) => f.path === field.path) && (
                              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            {!selectedFields.some((f) => f.path === field.path) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleField(field);
                                }}
                                className="text-gray-400 hover:text-green-500"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Selected Fields */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Fields ({selectedFields.length})
                  </h3>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                    {selectedFields.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No fields selected
                      </p>
                    ) : (
                      selectedFields.map((field) => (
                        <div
                          key={field.path}
                          className="p-2 rounded border bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {field.label}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {field.path}
                              </p>
                            </div>
                            <button
                              onClick={() => removeSelectedField(field.path)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          {(field.type === 'number' || (typeof field.sampleValue === 'number')) && (
                            <div className="mt-2">
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                Format:
                              </label>
                              <select
                                value={field.format || 'none'}
                                onChange={(e) => updateFieldFormat(field.path, e.target.value as FieldFormat)}
                                className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="none">None</option>
                                <option value="number">Number</option>
                                <option value="currency">Currency</option>
                                <option value="percentage">Percentage</option>
                                <option value="compact">Compact</option>
                              </select>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!testResult?.success || selectedFields.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingWidget ? 'Update Widget' : 'Add Widget'}
          </button>
        </div>
      </div>
    </div>
  );
};
