import { WidgetField, ApiTestResult } from '@/types/widget';

// Cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

// Helper to flatten nested objects and extract fields
export function extractFields(obj: any, prefix = '', maxDepth = 5, currentDepth = 0): WidgetField[] {
  if (currentDepth >= maxDepth) return [];
  
  const fields: WidgetField[] = [];
  
  if (obj === null || obj === undefined) {
    return fields;
  }
  
  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      // For arrays, show the first element's structure
      const firstItem = obj[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        fields.push({
          path: prefix || 'root',
          label: prefix || 'Array',
          type: 'array',
          sampleValue: obj.slice(0, 3), // Show first 3 items as sample
        });
        // Recursively extract fields from first item
        const nestedFields = extractFields(firstItem, prefix, maxDepth, currentDepth + 1);
        fields.push(...nestedFields);
      } else {
        fields.push({
          path: prefix || 'root',
          label: prefix || 'Array',
          type: 'array',
          sampleValue: obj.slice(0, 5),
        });
      }
    }
    return fields;
  }
  
  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      const fieldType = Array.isArray(value) ? 'array' : typeof value as WidgetField['type'];
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively extract nested object fields
        const nestedFields = extractFields(value, fieldPath, maxDepth, currentDepth + 1);
        fields.push(...nestedFields);
      } else {
        fields.push({
          path: fieldPath,
          label: key,
          type: fieldType,
          sampleValue: Array.isArray(value) ? value.slice(0, 3) : value,
        });
      }
    }
  } else {
    fields.push({
      path: prefix || 'root',
      label: prefix || 'Value',
      type: typeof obj as WidgetField['type'],
      sampleValue: obj,
    });
  }
  
  return fields;
}

// Get value from nested object using dot notation path
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      // If current is array, get from first element
      return current[0]?.[key];
    }
    return current[key];
  }, obj);
}

// Test API endpoint
export async function testApiEndpoint(url: string): Promise<ApiTestResult> {
  // Check cache first
  const cacheKey = `test_${url}`;
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    const fields = extractFields(cached.data);
    return {
      success: true,
      data: cached.data,
      fields,
    };
  }

  try {
    // Use Next.js API route to avoid CORS issues
    const response = await fetch('/api/widget-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      
      // Handle rate limiting
      if (response.status === 429) {
        errorMessage = 'API rate limit exceeded. Please try again later or reduce refresh interval.';
      } else if (response.status === 403) {
        errorMessage = 'API access forbidden. Please check your API key or permissions.';
      } else if (response.status === 401) {
        errorMessage = 'API authentication failed. Please check your API key.';
      } else if (response.status >= 500) {
        errorMessage = 'API server error. Please try again later.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    
    // Cache the response
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    const fields = extractFields(data);
    
    return {
      success: true,
      data,
      fields,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch data from API',
    };
  }
}

// Fetch widget data
export async function fetchWidgetData(apiUrl: string, fields: WidgetField[]): Promise<any> {
  const cacheKey = `widget_${apiUrl}`;
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch('/api/widget-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: apiUrl }),
    });

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status}`;
      
      // Handle rate limiting
      if (response.status === 429) {
        errorMessage = 'API rate limit exceeded. Please try again later or reduce refresh interval.';
      } else if (response.status === 403) {
        errorMessage = 'API access forbidden. Please check your API key or permissions.';
      } else if (response.status === 401) {
        errorMessage = 'API authentication failed. Please check your API key.';
      } else if (response.status >= 500) {
        errorMessage = 'API server error. Please try again later.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Cache the response
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch widget data');
  }
}

// Clear cache
export function clearApiCache(): void {
  apiCache.clear();
}
