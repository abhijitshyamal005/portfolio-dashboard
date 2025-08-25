import { FinancialData, ApiResponse } from '@/types/portfolio';

// Mock data for demonstration purposes
// In a real implementation, you would use web scraping or unofficial libraries

const MOCK_STOCK_DATA: Record<string, FinancialData> = {
  // Technology Stocks
  'KPIT TECH': {
    cmp: 1250.75,
    peRatio: 45.2,
    latestEarnings: 28.50,
    lastUpdated: new Date()
  },
  'TATA TECH': {
    cmp: 850.25,
    peRatio: 38.5,
    latestEarnings: 22.75,
    lastUpdated: new Date()
  },
  'INFY': {
    cmp: 1450.50,
    peRatio: 22.8,
    latestEarnings: 78.25,
    lastUpdated: new Date()
  },
  'HAPPIEST MINDS': {
    cmp: 650.00,
    peRatio: 35.2,
    latestEarnings: 18.50,
    lastUpdated: new Date()
  },
  'EASEMYTRIP': {
    cmp: 420.75,
    peRatio: 28.5,
    latestEarnings: 15.25,
    lastUpdated: new Date()
  },

  // Consumer Stocks
  'DMART': {
    cmp: 3800.00,
    peRatio: 65.8,
    latestEarnings: 58.90,
    lastUpdated: new Date()
  },
  'TATA CONSUMER': {
    cmp: 1250.50,
    peRatio: 42.3,
    latestEarnings: 29.75,
    lastUpdated: new Date()
  },
  'PIDILITE': {
    cmp: 2850.75,
    peRatio: 55.2,
    latestEarnings: 52.50,
    lastUpdated: new Date()
  },

  // Power Stocks
  'TATA POWER': {
    cmp: 320.50,
    peRatio: 18.5,
    latestEarnings: 17.25,
    lastUpdated: new Date()
  },
  'KPI GREEN': {
    cmp: 1850.00,
    peRatio: 28.7,
    latestEarnings: 65.50,
    lastUpdated: new Date()
  },
  'SUZLON': {
    cmp: 45.75,
    peRatio: 15.2,
    latestEarnings: 3.25,
    lastUpdated: new Date()
  },
  'GENSOL': {
    cmp: 1250.00,
    peRatio: 32.5,
    latestEarnings: 38.75,
    lastUpdated: new Date()
  },

  // Pipe Sector
  'HARIOM PIPES': {
    cmp: 650.25,
    peRatio: 25.8,
    latestEarnings: 25.50,
    lastUpdated: new Date()
  },
  'ASTRAL': {
    cmp: 1850.50,
    peRatio: 45.2,
    latestEarnings: 42.75,
    lastUpdated: new Date()
  },
  'POLYCAB': {
    cmp: 4850.75,
    peRatio: 38.5,
    latestEarnings: 125.50,
    lastUpdated: new Date()
  },

  // Other Stocks
  'CLEAN SCIENCE': {
    cmp: 1850.00,
    peRatio: 42.8,
    latestEarnings: 43.25,
    lastUpdated: new Date()
  },
  'DEEPAK NITRITE': {
    cmp: 2250.50,
    peRatio: 35.5,
    latestEarnings: 63.50,
    lastUpdated: new Date()
  },
  'FINE ORGANIC': {
    cmp: 2850.75,
    peRatio: 28.2,
    latestEarnings: 102.25,
    lastUpdated: new Date()
  },
  'GRAVITA': {
    cmp: 1250.00,
    peRatio: 32.8,
    latestEarnings: 38.75,
    lastUpdated: new Date()
  },
  'SBI LIFE': {
    cmp: 1450.25,
    peRatio: 25.5,
    latestEarnings: 58.50,
    lastUpdated: new Date()
  },

  // Legacy stocks (keeping for compatibility)
  'RELIANCE': {
    cmp: 2450.75,
    peRatio: 18.5,
    latestEarnings: 125.50,
    lastUpdated: new Date()
  },
  'TCS': {
    cmp: 3850.25,
    peRatio: 25.2,
    latestEarnings: 95.75,
    lastUpdated: new Date()
  },
  'HDFC': {
    cmp: 1650.00,
    peRatio: 19.8,
    latestEarnings: 112.50,
    lastUpdated: new Date()
  },
  'ICICIBANK': {
    cmp: 950.75,
    peRatio: 16.5,
    latestEarnings: 68.75,
    lastUpdated: new Date()
  },
  'WIPRO': {
    cmp: 450.25,
    peRatio: 20.1,
    latestEarnings: 45.50,
    lastUpdated: new Date()
  },
  'TATAMOTORS': {
    cmp: 750.50,
    peRatio: 28.5,
    latestEarnings: 35.25,
    lastUpdated: new Date()
  },
  'AXISBANK': {
    cmp: 850.00,
    peRatio: 17.2,
    latestEarnings: 58.90,
    lastUpdated: new Date()
  }
};

// Simulate API delay and occasional failures
const simulateApiCall = async <T>(data: T, shouldFail = false): Promise<ApiResponse<T>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  
  if (shouldFail && Math.random() < 0.1) { // 10% chance of failure
    return {
      success: false,
      error: 'API rate limit exceeded or service unavailable',
      timestamp: new Date()
    };
  }
  
  return {
    success: true,
    data,
    timestamp: new Date()
  };
};

// Yahoo Finance API simulation (for CMP)
export const fetchYahooFinanceData = async (symbol: string): Promise<ApiResponse<{ cmp: number }>> => {
  try {
    // In a real implementation, you would:
    // 1. Use a library like yahoo-finance2 or similar
    // 2. Or implement web scraping using puppeteer/cheerio
    // 3. Handle rate limiting and caching
    
    const mockData = MOCK_STOCK_DATA[symbol] || {
      cmp: Math.random() * 5000 + 100, // Random price for unknown symbols
      peRatio: 0,
      latestEarnings: 0,
      lastUpdated: new Date()
    };
    
    // Simulate price fluctuations
    const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
    const updatedCmp = mockData.cmp * (1 + fluctuation);
    
    return await simulateApiCall({ cmp: Math.round(updatedCmp * 100) / 100 });
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch Yahoo Finance data: ${error}`,
      timestamp: new Date()
    };
  }
};

// Google Finance API simulation (for P/E Ratio and Earnings)
export const fetchGoogleFinanceData = async (symbol: string): Promise<ApiResponse<{ peRatio: number; latestEarnings: number }>> => {
  try {
    // In a real implementation, you would:
    // 1. Use a library like google-finance or similar
    // 2. Or implement web scraping
    // 3. Handle rate limiting and caching
    
    const mockData = MOCK_STOCK_DATA[symbol] || {
      cmp: 0,
      peRatio: Math.random() * 30 + 10, // Random P/E ratio
      latestEarnings: Math.random() * 200 + 50, // Random earnings
      lastUpdated: new Date()
    };
    
    return await simulateApiCall({
      peRatio: Math.round(mockData.peRatio * 10) / 10,
      latestEarnings: Math.round(mockData.latestEarnings * 100) / 100
    });
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch Google Finance data: ${error}`,
      timestamp: new Date()
    };
  }
};

// Combined API call for all financial data
export const fetchFinancialData = async (symbol: string): Promise<ApiResponse<FinancialData>> => {
  try {
    const [yahooResponse, googleResponse] = await Promise.all([
      fetchYahooFinanceData(symbol),
      fetchGoogleFinanceData(symbol)
    ]);
    
    if (!yahooResponse.success || !googleResponse.success) {
      return {
        success: false,
        error: `API failures: Yahoo: ${yahooResponse.error}, Google: ${googleResponse.error}`,
        timestamp: new Date()
      };
    }
    
    return {
      success: true,
      data: {
        cmp: yahooResponse.data!.cmp,
        peRatio: googleResponse.data!.peRatio,
        latestEarnings: googleResponse.data!.latestEarnings,
        lastUpdated: new Date()
      },
      timestamp: new Date()
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch financial data: ${error}`,
      timestamp: new Date()
    };
  }
};
