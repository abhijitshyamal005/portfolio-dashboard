export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(value);
};

export const formatCompactCurrency = (value: number): string => {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} K`;
  }
  return formatCurrency(value);
};

export const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

import type { WidgetField, FieldFormat } from '@/types/widget';

export const formatFieldValue = (value: any, field: WidgetField): string => {
  if (value === null || value === undefined) return 'N/A';
  
  const format = field.format || 'none';
  
  // Try to parse as number if it's a string
  let numValue: number | null = null;
  if (typeof value === 'number') {
    numValue = value;
  } else if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      numValue = parsed;
    }
  }
  
  // Apply formatting based on field format
  if (numValue !== null) {
    switch (format) {
      case 'currency':
        return formatCurrency(numValue);
      case 'percentage':
        return formatPercentage(numValue);
      case 'number':
        return formatNumber(numValue);
      case 'compact':
        return formatCompactNumber(numValue);
      case 'none':
      default:
        return String(value);
    }
  }
  
  return String(value);
};
