# Portfolio Dashboard Setup Instructions

## 🎉 **CORS Issues SOLVED! - Manual Control System**

The dashboard now uses **server-side API routes** that completely bypass CORS issues and provides **user-controlled data fetching** - no more automatic updates!

### 1. Create `.env.local` file

Create a new file called `.env.local` in your project root directory (`C:\Users\abhij\Documents\portfolio-dashboard\`) with this content:

```env
# Portfolio Dashboard Environment Configuration

# API Rate Limiting
MAX_REQUESTS_PER_MINUTE=30
UPDATE_INTERVAL_MS=15000

# Yahoo Finance API Settings
YAHOO_FINANCE_TIMEOUT=15000
YAHOO_FINANCE_RETRY_ATTEMPTS=3

# Google Finance Scraping Settings
GOOGLE_FINANCE_TIMEOUT=15000
GOOGLE_FINANCE_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Market Hours (IST)
MARKET_START_HOUR=9
MARKET_START_MINUTE=15
MARKET_END_HOUR=15
MARKET_END_MINUTE=30

# Logging
ENABLE_API_LOGGING=true
ENABLE_DEBUG_MODE=true

# Error Handling
MAX_RETRIES=3
RETRY_DELAY_MS=2000
GRACEFUL_DEGRADATION=true

# Cache Settings
ENABLE_CACHING=true
CACHE_DURATION_MS=30000
MAX_CACHE_SIZE=100
```

### 2. Test the Dashboard

After creating the `.env.local` file:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser** and go to `http://localhost:3002` (or whatever port is shown)

3. **The dashboard should now:**
   - ✅ **Display current time** in IST with market open/closed status
   - ✅ **Show portfolio structure** with sample data (no live data initially)
   - ✅ **Provide manual controls** for data fetching
   - ✅ **No automatic updates** - everything is user-controlled
   - ✅ **Real-time data** when you manually fetch it

### 3. How to Use the New Manual System

**🚫 No More Automatic Updates:**
- ❌ **No 15-second intervals**
- ❌ **No background data fetching**
- ❌ **No automatic market data updates**

**✅ New Manual Control System:**
- **📊 "Fetch Data Now" Button**: Click to fetch live data for ALL companies
- **🔄 "Refresh" Button**: Quick refresh of existing data
- **📁 "Import Excel" Button**: Import your own portfolio data
- **📋 "Sample Data" Button**: Reset to sample portfolio
- **⏰ Current Time Display**: Live clock showing IST time
- **📈 Market Status**: Shows if Indian market is open/closed

### 4. What Happens When You Click "Fetch Data Now"

1. **Button shows "Fetching..."** with loading spinner
2. **Server fetches data** for all portfolio companies:
   - TCS, RELIANCE, INFY, HDFC, ICICIBANK, TATAMOTORS, AXISBANK, WIPRO
3. **Real-time data retrieved** from:
   - **Yahoo Finance**: Live stock prices (CMP)
   - **Google Finance**: P/E ratios and earnings
4. **Portfolio updates** with live calculations:
   - Present Value, Gain/Loss, Portfolio percentages
5. **Status shows** "Data fetch completed successfully!"
6. **Last updated timestamp** displays when data was fetched

### 5. Expected Results

- **First Load**: Portfolio structure with ₹0 values (no live data)
- **After "Fetch Data Now"**: Real stock prices and financial metrics
- **Example Data**: TCS at ₹3,148, RELIANCE at ₹2,450, etc.
- **Real-time Calculations**: Accurate gain/loss and portfolio percentages
- **Sector Grouping**: Organized by Technology, Banking, Oil & Gas, etc.

### 6. Console Logging

With `ENABLE_API_LOGGING=true`, you'll see:
- ✅ **Manual fetch requests** when you click buttons
- ✅ **Batch processing** of multiple companies
- ✅ **API responses** from Yahoo Finance and Google Finance
- ✅ **No automatic background processes**

### 7. Performance Features

- **User-controlled fetching** - only when you want data
- **Batch processing** - fetches all companies efficiently
- **Intelligent caching** - reduces API calls for repeated fetches
- **Market hours detection** - shows if market is open
- **No unnecessary updates** - saves API quota and resources

### 8. Benefits of Manual Control

- **🎯 User Choice**: Fetch data when you need it
- **💰 API Efficiency**: No wasted API calls
- **⚡ Better Performance**: No background processes
- **🕒 Time Control**: Update when market is most active
- **📊 Data Freshness**: Always get the latest data when you fetch

---

**🎯 The dashboard is now USER-CONTROLLED with real financial data!**

**No more automatic updates, no more CORS errors - just reliable, manual portfolio tracking! 🚀**

**Your workflow:**
1. **Open dashboard** → See portfolio structure
2. **Click "Fetch Data Now"** → Get live market data
3. **Analyze portfolio** → Real-time performance metrics
4. **Refresh when needed** → Manual control over data freshness
5. **Import your data** → Use your own portfolio
