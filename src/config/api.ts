// API Configuration for Portfolio Dashboard
// This file contains all the configuration options for external APIs

export const API_CONFIG = {
  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '30'),
  UPDATE_INTERVAL_MS: parseInt(process.env.UPDATE_INTERVAL_MS || '15000'),
  
  // Yahoo Finance API Settings
  YAHOO_FINANCE: {
    TIMEOUT: parseInt(process.env.YAHOO_FINANCE_TIMEOUT || '10000'),
    RETRY_ATTEMPTS: parseInt(process.env.YAHOO_FINANCE_RETRY_ATTEMPTS || '3'),
    BATCH_SIZE: 5, // Number of symbols to fetch in parallel
  },
  
  // Google Finance Scraping Settings
  GOOGLE_FINANCE: {
    TIMEOUT: parseInt(process.env.GOOGLE_FINANCE_TIMEOUT || '10000'),
    USER_AGENT: process.env.GOOGLE_FINANCE_USER_AGENT || 
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    RETRY_ATTEMPTS: 2,
  },
  
  // Market Hours (IST)
  MARKET_HOURS: {
    START_HOUR: parseInt(process.env.MARKET_START_HOUR || '9'),
    START_MINUTE: parseInt(process.env.MARKET_START_MINUTE || '15'),
    END_HOUR: parseInt(process.env.MARKET_END_HOUR || '15'),
    END_MINUTE: parseInt(process.env.MARKET_END_MINUTE || '30'),
  },
  
  // Logging
  LOGGING: {
    ENABLE_API_LOGGING: process.env.ENABLE_API_LOGGING === 'true',
    ENABLE_DEBUG_MODE: process.env.ENABLE_DEBUG_MODE === 'true',
  },
  
  // Alternative Data Sources
  ALTERNATIVE_SOURCES: {
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
    IEX_CLOUD_API_KEY: process.env.IEX_CLOUD_API_KEY,
  },
  
  // Error Handling
  ERROR_HANDLING: {
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    GRACEFUL_DEGRADATION: true, // Continue with partial data if some sources fail
  },
  
  // Cache Settings
  CACHE: {
    ENABLE_CACHING: true,
    CACHE_DURATION_MS: 30000, // 30 seconds
    MAX_CACHE_SIZE: 100, // Maximum number of cached entries
  }
};

// Helper function to check if market is open
export const isMarketOpen = (date: Date = new Date()): boolean => {
  const { START_HOUR, START_MINUTE, END_HOUR, END_MINUTE } = API_CONFIG.MARKET_HOURS;
  
  const day = date.getDay();
  if (day === 0 || day === 6) return false; // Weekend
  
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeInMinutes = hour * 60 + minute;
  
  const marketStart = START_HOUR * 60 + START_MINUTE;
  const marketEnd = END_HOUR * 60 + END_MINUTE;
  
  return timeInMinutes >= marketStart && timeInMinutes <= marketEnd;
};

// Helper function to get formatted market hours
export const getMarketHours = (): string => {
  const { START_HOUR, START_MINUTE, END_HOUR, END_MINUTE } = API_CONFIG.MARKET_HOURS;
  
  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };
  
  return `${formatTime(START_HOUR, START_MINUTE)} - ${formatTime(END_HOUR, END_MINUTE)} IST`;
};

// Helper function to get next market open time
export const getNextMarketOpen = (): Date => {
  const now = new Date();
  const { START_HOUR, START_MINUTE } = API_CONFIG.MARKET_HOURS;
  
  const nextOpen = new Date(now);
  nextOpen.setHours(START_HOUR, START_MINUTE, 0, 0);
  
  // If market is already open today, get next business day
  if (now > nextOpen) {
    nextOpen.setDate(nextOpen.getDate() + 1);
    
    // Skip weekends
    while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
      nextOpen.setDate(nextOpen.getDate() + 1);
    }
  }
  
  return nextOpen;
};
