# Finance Dashboard - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Getting Started](#getting-started)
6. [Widget System](#widget-system)
7. [API Integration](#api-integration)
8. [Architecture](#architecture)
9. [Development Guide](#development-guide)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)

---

## Overview

Finance Dashboard is a customizable, real-time finance monitoring application built with Next.js 15, TypeScript, and Tailwind CSS. It allows users to create personalized dashboards by connecting to any financial API and displaying data through configurable widgets.

### Key Highlights

- **Widget-Based Architecture**: Create custom widgets that connect to any JSON API
- **Real-Time Updates**: Automatic data refresh with configurable intervals
- **Multiple Display Types**: Cards, Tables, and Charts (Line & Candlestick)
- **Drag & Drop**: Reorder widgets with intuitive drag-and-drop interface
- **Dark Mode**: Built-in theme switching with persistent preferences
- **CORS-Free**: Server-side API proxy eliminates CORS issues
- **Type-Safe**: Full TypeScript support for better development experience

---

## Features

### Core Features

#### 📊 Widget Types
- **Card Widget**: Display key-value pairs in a clean card format
- **Table Widget**: Show tabular data with sorting and pagination
- **Chart Widget**: Visualize data with line or candlestick charts

#### 🔄 Real-Time Updates
- Configurable refresh intervals (in seconds)
- Automatic data fetching from APIs
- Visual indicators for last update time
- Manual refresh option for each widget

#### 🎨 User Interface
- Modern, responsive design
- Dark/Light theme support
- Drag-and-drop widget reordering
- Intuitive widget management (add, edit, delete)

#### 🔌 API Integration
- Connect to any JSON API endpoint
- Automatic field detection from API responses
- Support for nested JSON structures
- Field path selection with dot notation
- Multiple data format options (currency, percentage, number, compact)

#### 💾 Data Persistence
- LocalStorage-based state management
- Widget configurations persist across sessions
- Theme preferences saved automatically

---

## Installation

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (or yarn/pnpm)
- **Git**: For cloning the repository

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd portfolio-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Configuration

### Environment Variables

Currently, the application doesn't require environment variables for basic functionality. However, if you need to configure API keys or other settings, create a `.env.local` file in the project root:

```env
# Example environment variables (if needed in future)
# API_KEY=your-api-key
# API_BASE_URL=https://api.example.com
```

### Browser Requirements

- Modern browser with JavaScript enabled
- LocalStorage support (for data persistence)
- Minimum viewport: 320px width

---

## Getting Started

### Creating Your First Widget

1. **Click "Add Widget"** button on the dashboard
2. **Enter API URL**: Provide a JSON API endpoint
   - Example: `https://api.example.com/data`
   - Must return valid JSON
   - Must be HTTPS (or localhost for development)
3. **Test Connection**: Click "Test API" to verify the endpoint
4. **Configure Widget**:
   - **Name**: Give your widget a descriptive name
   - **Description**: Optional description
   - **Type**: Choose Card, Table, or Chart
   - **Fields**: Select which data fields to display
   - **Refresh Interval**: Set how often to update (in seconds)
5. **Save**: Click "Add Widget" to create

### Widget Configuration Options

#### Widget Types

**Card Widget**
- Best for: Single values, key metrics, status indicators
- Displays: Key-value pairs in a clean card layout
- Fields: Select one or more fields to display

**Table Widget**
- Best for: Tabular data, lists, comparisons
- Displays: Sortable table with pagination
- Fields: Multiple fields shown as columns
- Features: Search, sorting, pagination

**Chart Widget**
- Best for: Time series data, trends, visualizations
- Displays: Line or candlestick charts
- Fields: Numeric fields for Y-axis
- Chart Types:
  - **Line Chart**: For continuous data over time
  - **Candlestick Chart**: For OHLC (Open/High/Low/Close) data
- Chart Intervals: Daily, Weekly, Monthly

#### Field Configuration

**Field Path**
- Use dot notation for nested fields: `data.price.close`
- For arrays, access first element: `prices.0.value`
- Root level fields: `symbol`, `price`

**Field Format**
- **None**: Raw value display
- **Currency**: Format as currency ($1,234.56)
- **Percentage**: Format as percentage (12.5%)
- **Number**: Format with thousand separators (1,234.56)
- **Compact**: Compact notation (1.2K, 1.5M)

**Field Type**
- Automatically detected from API response
- Types: string, number, boolean, array, object

### Managing Widgets

#### Reordering Widgets
- Click and drag the drag handle (☰ icon) in the top-right corner of any widget
- Widgets will automatically save their new positions

#### Editing Widgets
- Click the edit icon (✏️) on any widget
- Modify any configuration
- Save changes

#### Deleting Widgets
- Click the delete icon (🗑️) on any widget
- Confirm deletion in the dialog

#### Refreshing Data
- Click the refresh icon (🔄) to manually update widget data
- Widgets also auto-refresh based on their refresh interval

### Theme Management

- Toggle between light and dark themes
- Theme preference is saved automatically
- Applies to all widgets and UI elements

---

## Widget System

### Widget Configuration Schema

```typescript
interface WidgetConfig {
  id: string;                    // Unique identifier
  name: string;                  // Widget display name
  description?: string;          // Optional description
  type: 'card' | 'table' | 'chart';
  apiUrl: string;                // API endpoint URL
  refreshInterval: number;       // Refresh interval in seconds
  fields: WidgetField[];         // Selected fields to display
  displayMode?: 'card' | 'table' | 'chart';
  chartType?: 'line' | 'candle';
  chartInterval?: 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
  lastUpdated?: Date;
}

interface WidgetField {
  path: string;                  // Dot notation path (e.g., "data.price")
  label: string;                 // Display label
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  sampleValue?: any;             // Sample value from API
  format?: 'none' | 'currency' | 'percentage' | 'number' | 'compact';
}
```

### Field Path Examples

```javascript
// Simple field
{ path: "symbol", label: "Symbol" }

// Nested field
{ path: "data.price.close", label: "Close Price" }

// Array element
{ path: "prices.0.value", label: "First Price" }

// Deep nesting
{ path: "market.data.quote.price", label: "Quote Price" }
```

### Widget Data Flow

1. **API Request**: Widget fetches data from configured API URL
2. **Data Transformation**: Response is parsed and fields extracted
3. **Field Mapping**: Selected fields are extracted using dot notation paths
4. **Formatting**: Values are formatted according to field format settings
5. **Rendering**: Widget renders data in selected display type
6. **Auto-Refresh**: Process repeats at configured interval

---

## API Integration

### Supported APIs

The dashboard can connect to any JSON API that:
- Returns valid JSON
- Uses HTTPS (or localhost for development)
- Responds within 10 seconds
- Doesn't require complex authentication (basic headers supported)

### API Response Format

The dashboard automatically detects fields from any JSON structure:

```json
// Simple object
{
  "symbol": "AAPL",
  "price": 150.25,
  "change": 2.5
}

// Nested object
{
  "data": {
    "quote": {
      "price": 150.25,
      "volume": 1000000
    }
  }
}

// Array of objects
{
  "prices": [
    { "date": "2024-01-01", "value": 150.25 },
    { "date": "2024-01-02", "value": 151.50 }
  ]
}
```

### API Proxy

The application uses a server-side proxy (`/api/widget-proxy`) to:
- Avoid CORS issues
- Add security validation
- Handle timeouts
- Provide error handling

### Security Features

- **HTTPS Only**: Only HTTPS URLs allowed (except localhost)
- **URL Validation**: Strict URL format validation
- **Timeout Protection**: 10-second request timeout
- **Error Handling**: Comprehensive error messages

### Rate Limiting

If you encounter rate limiting:
- Increase refresh intervals
- Reduce number of widgets
- Contact API provider for higher limits

---

## Architecture

### Technology Stack

#### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS 4**: Styling
- **Zustand**: State management
- **Recharts**: Chart visualization
- **@dnd-kit**: Drag and drop functionality

#### Backend
- **Next.js API Routes**: Server-side endpoints
- **Node.js**: Runtime environment

### Project Structure

```
portfolio-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── widget-proxy/     # API proxy endpoint
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── FinanceDashboard.tsx  # Main dashboard component
│   │   ├── AddWidgetModal.tsx    # Widget creation modal
│   │   └── widgets/
│   │       ├── WidgetCard.tsx    # Card widget component
│   │       ├── WidgetTable.tsx   # Table widget component
│   │       └── WidgetChart.tsx   # Chart widget component
│   ├── services/
│   │   └── widgetApi.ts          # API service functions
│   ├── store/
│   │   └── dashboardStore.ts     # Zustand state store
│   ├── types/
│   │   └── widget.ts             # TypeScript type definitions
│   └── utils/
│       └── formatters.ts         # Data formatting utilities
├── public/                       # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

### State Management

The application uses **Zustand** for state management with persistence:

```typescript
// Store structure
{
  widgets: WidgetConfig[];        // All widget configurations
  theme: 'light' | 'dark';         // Current theme
}

// Actions
- addWidget(widget)
- removeWidget(id)
- updateWidget(id, updates)
- reorderWidgets(ids)
- setTheme(theme)
```

### Data Flow

1. **User Action** → Component
2. **Component** → Zustand Store
3. **Store** → LocalStorage (persist)
4. **Store** → Component (re-render)
5. **Component** → API Service
6. **API Service** → Next.js API Route
7. **API Route** → External API
8. **Response** → Component → Widget Display

### Caching Strategy

- **API Response Cache**: 60 seconds (1 minute)
- **Cache Key**: Based on API URL
- **Cache Invalidation**: Automatic after cache duration

---

## Development Guide

### Development Setup

1. **Clone and install** (see Installation section)
2. **Start dev server**: `npm run dev`
3. **Open**: `http://localhost:3000`

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Formatting**: Prettier (if configured)

### Adding New Widget Types

1. **Create Component**: `src/components/widgets/WidgetNewType.tsx`
2. **Add Type**: Update `WidgetType` in `src/types/widget.ts`
3. **Update Renderer**: Add case in `FinanceDashboard.tsx`
4. **Update Modal**: Add option in `AddWidgetModal.tsx`

### Adding New Field Formats

1. **Update Type**: Add to `FieldFormat` in `src/types/widget.ts`
2. **Add Formatter**: Implement in `src/utils/formatters.ts`
3. **Update UI**: Add option in `AddWidgetModal.tsx`

### Testing APIs

Use the "Test API" feature in the Add Widget modal to:
- Verify API connectivity
- Inspect response structure
- Preview available fields
- Check for errors

---

## Troubleshooting

### Common Issues

#### Widget Not Loading Data

**Symptoms**: Widget shows loading spinner or error message

**Solutions**:
1. Check API URL is correct and accessible
2. Verify API returns valid JSON
3. Check browser console for errors
4. Verify API doesn't require authentication
5. Check network tab for failed requests

#### CORS Errors

**Symptoms**: "CORS policy" errors in console

**Solutions**:
- The app uses server-side proxy, so CORS shouldn't be an issue
- If errors persist, check API proxy route is working
- Verify API URL uses HTTPS

#### Widget Fields Not Showing

**Symptoms**: Widget displays but no data fields visible

**Solutions**:
1. Click "Test API" to verify field structure
2. Check field paths match API response structure
3. Verify fields are selected in widget configuration
4. Check field types match expected format

#### Theme Not Persisting

**Symptoms**: Theme resets on page refresh

**Solutions**:
1. Check browser allows LocalStorage
2. Clear browser cache and try again
3. Check browser console for storage errors

#### Drag and Drop Not Working

**Symptoms**: Can't reorder widgets

**Solutions**:
1. Check browser supports drag events
2. Try clicking and holding the drag handle
3. Refresh the page
4. Check browser console for errors

### Error Messages

#### "API request failed: 429"
- **Cause**: Rate limit exceeded
- **Solution**: Increase refresh interval or reduce widget count

#### "API request failed: 403"
- **Cause**: Access forbidden
- **Solution**: Check API key or permissions

#### "API request failed: 401"
- **Cause**: Authentication failed
- **Solution**: Verify API credentials

#### "Request timeout"
- **Cause**: API took longer than 10 seconds
- **Solution**: Check API performance or increase timeout in code

### Debug Mode

Enable debug logging by checking browser console:
- API requests and responses
- State changes
- Error details

---

## Contributing

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style
- Add TypeScript types for new features
- Update documentation for new features
- Test your changes thoroughly
- Write clear commit messages

### Areas for Contribution

- New widget types
- Additional field formats
- Chart improvements
- Performance optimizations
- Documentation improvements
- Bug fixes
- UI/UX enhancements

---

## License

[Add your license information here]

---

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

## Changelog

### Version 0.1.0
- Initial release
- Widget system (Card, Table, Chart)
- Drag and drop reordering
- Dark mode support
- API proxy integration
- LocalStorage persistence

---

**Last Updated**: [Current Date]
**Version**: 0.1.0
