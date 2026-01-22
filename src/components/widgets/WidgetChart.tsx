'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, ReferenceLine } from 'recharts';
import { WidgetConfig, WidgetField } from '@/types/widget';
import { fetchWidgetData, getNestedValue } from '@/services/widgetApi';

interface WidgetChartProps {
  widget: WidgetConfig;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

export const WidgetChart: React.FC<WidgetChartProps> = ({
  widget,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchWidgetData(widget.apiUrl, widget.fields);
      setData(result);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [widget.apiUrl, widget.fields]);

  useEffect(() => {
    if (widget.refreshInterval > 0) {
      const interval = setInterval(fetchData, widget.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [widget.refreshInterval]);

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!data) return [];
    
    // Try to find time series data
    const findTimeSeries = (obj: any): any[] => {
      if (Array.isArray(obj)) {
        // Check if it's an array of objects with time/data fields
        if (obj.length > 0 && typeof obj[0] === 'object') {
          return obj;
        }
      }
      
      if (typeof obj === 'object' && obj !== null) {
        // Look for common time series keys
        const timeSeriesKeys = ['data', 'values', 'series', 'timeSeries', 'history', 'prices'];
        for (const key of timeSeriesKeys) {
          if (Array.isArray(obj[key])) {
            return obj[key];
          }
        }
        
        // Recursively search
        for (const value of Object.values(obj)) {
          const found = findTimeSeries(value);
          if (found.length > 0) return found;
        }
      }
      
      return [];
    };

    const timeSeries = findTimeSeries(data);
    
    if (timeSeries.length === 0) {
      // If no time series found, create a simple chart from the first field
      if (widget.fields.length > 0) {
        return [{
          name: 'Value',
          value: getNestedValue(data, widget.fields[0].path),
        }];
      }
      return [];
    }

    // Transform to chart format
    return timeSeries.map((item, idx) => {
      const chartPoint: any = {};
      
      // Try to find a date/time field
      const dateFields = ['date', 'time', 'timestamp', 'datetime', 'x'];
      for (const field of dateFields) {
        if (item[field]) {
          chartPoint.name = new Date(item[field]).toLocaleDateString();
          break;
        }
      }
      
      if (!chartPoint.name) {
        chartPoint.name = `Point ${idx + 1}`;
      }
      
      // Add all numeric fields
      widget.fields.forEach((field) => {
        const value = getNestedValue(item, field.path);
        if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
          chartPoint[field.label] = parseFloat(String(value));
        }
      });
      
      // Try to detect OHLC data for candle charts
      if (widget.chartType === 'candle') {
        const ohlcFields = ['open', 'high', 'low', 'close', 'o', 'h', 'l', 'c'];
        ohlcFields.forEach(ohlc => {
          const ohlcValue = item[ohlc] || getNestedValue(item, ohlc);
          if (ohlcValue !== undefined && (typeof ohlcValue === 'number' || !isNaN(parseFloat(ohlcValue)))) {
            chartPoint[`ohlc_${ohlc}`] = parseFloat(String(ohlcValue));
          }
        });
      }
      
      return chartPoint;
    });
  }, [data, widget.fields]);

  const numericFields = useMemo(() => {
    return widget.fields.filter((field) => {
      if (field.type === 'number') return true;
      if (chartData.length > 0) {
        const firstValue = chartData[0][field.label];
        return typeof firstValue === 'number';
      }
      return false;
    });
  }, [widget.fields, chartData]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {widget.name}
            </h3>
            {widget.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {widget.description}
              </p>
            )}
          </div>
          {widget.refreshInterval > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {widget.refreshInterval}s
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Edit widget"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Refresh data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Delete widget"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            {widget.chartType === 'candle' ? (
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                {numericFields.map((field, idx) => {
                  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
                  // For candle charts, try to find OHLC data or use the field as close price
                  const hasOHLC = chartData.some((d: any) => d[`${field.label}_open`] || d[`${field.label}_high`] || d[`${field.label}_low`] || d[`${field.label}_close`]);
                  
                  if (hasOHLC) {
                    // If OHLC data exists, render as candlestick (simplified as bars)
                    return (
                      <Bar
                        key={field.path}
                        dataKey={field.label}
                        fill={colors[idx % colors.length]}
                        opacity={0.7}
                      />
                    );
                  } else {
                    // Fallback to line if no OHLC data
                    return (
                      <Line
                        key={field.path}
                        type="monotone"
                        dataKey={field.label}
                        stroke={colors[idx % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    );
                  }
                })}
              </ComposedChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                {numericFields.map((field, idx) => {
                  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
                  return (
                    <Line
                      key={field.path}
                      type="monotone"
                      dataKey={field.label}
                      stroke={colors[idx % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  );
                })}
              </LineChart>
            )}
          </ResponsiveContainer>
          {widget.chartInterval && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Interval: {widget.chartInterval.charAt(0).toUpperCase() + widget.chartInterval.slice(1)}
            </div>
          )}
        </div>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No chart data available</p>
        </div>
      )}

      {/* Footer */}
      {lastUpdated && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};
