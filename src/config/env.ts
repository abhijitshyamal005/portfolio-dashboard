// Environment Configuration for Portfolio Dashboard

export const ENV_CONFIG = {
  // API Rate Limiting
  MAX_REQUESTS_PER_MINUTE: 30,
  UPDATE_INTERVAL_MS: 15000,
  
  // Yahoo Finance API Settings
  YAHOO_FINANCE_TIMEOUT: 15000,
  YAHOO_FINANCE_RETRY_ATTEMPTS: 3,
  
  // Google Finance Scraping Settings
  GOOGLE_FINANCE_TIMEOUT: 15000,
  GOOGLE_FINANCE_USER_AGENT: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  
  // Market Hours (IST)
  MARKET_START_HOUR: 9,
  MARKET_START_MINUTE: 15,
  MARKET_END_HOUR: 15,
  MARKET_END_MINUTE: 30,
  
  // Logging
  ENABLE_API_LOGGING: true,
  ENABLE_DEBUG_MODE: true,
  
  // Error Handling
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  GRACEFUL_DEGRADATION: true,
  
  // Cache Settings
  ENABLE_CACHING: true,
  CACHE_DURATION_MS: 30000,
  MAX_CACHE_SIZE: 100,
};

// Helper function to get environment variable with fallback
export const getEnvVar = (key: string, fallback: string | number | boolean): string | number | boolean => {
  if (typeof window !== 'undefined') {
    return fallback;
  }
  
  // Server-side: try to get from process.env
  const value = process.env[key];
  if (value !== undefined) {
    if (typeof fallback === 'number') {
      return parseInt(value) || fallback;
    }
    if (typeof fallback === 'boolean') {
      return value === 'true';
    }
    return value;
  }
  
  return fallback;
};

// Export configuration with environment variable support
export const getConfig = () => ({
  MAX_REQUESTS_PER_MINUTE: getEnvVar('MAX_REQUESTS_PER_MINUTE', ENV_CONFIG.MAX_REQUESTS_PER_MINUTE) as number,
  UPDATE_INTERVAL_MS: getEnvVar('UPDATE_INTERVAL_MS', ENV_CONFIG.UPDATE_INTERVAL_MS) as number,
  YAHOO_FINANCE_TIMEOUT: getEnvVar('YAHOO_FINANCE_TIMEOUT', ENV_CONFIG.YAHOO_FINANCE_TIMEOUT) as number,
  YAHOO_FINANCE_RETRY_ATTEMPTS: getEnvVar('YAHOO_FINANCE_RETRY_ATTEMPTS', ENV_CONFIG.YAHOO_FINANCE_RETRY_ATTEMPTS) as number,
  GOOGLE_FINANCE_TIMEOUT: getEnvVar('GOOGLE_FINANCE_TIMEOUT', ENV_CONFIG.GOOGLE_FINANCE_TIMEOUT) as number,
  GOOGLE_FINANCE_USER_AGENT: getEnvVar('GOOGLE_FINANCE_USER_AGENT', ENV_CONFIG.GOOGLE_FINANCE_USER_AGENT) as string,
  MARKET_START_HOUR: getEnvVar('MARKET_START_HOUR', ENV_CONFIG.MARKET_START_HOUR) as number,
  MARKET_START_MINUTE: getEnvVar('MARKET_START_MINUTE', ENV_CONFIG.MARKET_START_MINUTE) as number,
  MARKET_END_HOUR: getEnvVar('MARKET_END_HOUR', ENV_CONFIG.MARKET_END_HOUR) as number,
  MARKET_END_MINUTE: getEnvVar('MARKET_END_MINUTE', ENV_CONFIG.MARKET_END_MINUTE) as number,
  ENABLE_API_LOGGING: getEnvVar('ENABLE_API_LOGGING', ENV_CONFIG.ENABLE_API_LOGGING) as boolean,
  ENABLE_DEBUG_MODE: getEnvVar('ENABLE_DEBUG_MODE', ENV_CONFIG.ENABLE_DEBUG_MODE) as boolean,
  MAX_RETRIES: getEnvVar('MAX_RETRIES', ENV_CONFIG.MAX_RETRIES) as number,
  RETRY_DELAY_MS: getEnvVar('RETRY_DELAY_MS', ENV_CONFIG.RETRY_DELAY_MS) as number,
  GRACEFUL_DEGRADATION: getEnvVar('GRACEFUL_DEGRADATION', ENV_CONFIG.GRACEFUL_DEGRADATION) as boolean,
  ENABLE_CACHING: getEnvVar('ENABLE_CACHING', ENV_CONFIG.ENABLE_CACHING) as boolean,
  CACHE_DURATION_MS: getEnvVar('CACHE_DURATION_MS', ENV_CONFIG.CACHE_DURATION_MS) as number,
  MAX_CACHE_SIZE: getEnvVar('MAX_CACHE_SIZE', ENV_CONFIG.MAX_CACHE_SIZE) as number,
});
