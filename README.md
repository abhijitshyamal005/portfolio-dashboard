# Portfolio Dashboard

A dynamic, real-time portfolio tracking dashboard built with Next.js, TypeScript, and Tailwind CSS. This application provides comprehensive portfolio management with live market data integration.

## 🚀 Features

### Core Functionality
- **Real-time Portfolio Tracking**: Live updates of stock prices, values, and performance metrics
- **Comprehensive Stock Data**: Displays all required fields including CMP, P/E Ratio, Latest Earnings
- **Sector Grouping**: Automatic categorization and summary by sector
- **Dynamic Updates**: Automatic refresh every 15 seconds with manual refresh option
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Data Display
- **Portfolio Table**: Complete holdings information with sortable columns
- **Overview Cards**: Summary metrics (Total Investment, Present Value, Gain/Loss, Return %)
- **Sector Summary**: Sector-wise breakdown with aggregated metrics
- **Visual Indicators**: Color-coded gains/losses for better UX

### Technical Features
- **TypeScript**: Full type safety and better development experience
- **Modern React**: Built with React 19 and Next.js 15
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **TanStack Table**: Powerful table component with sorting and filtering
- **Error Handling**: Graceful error handling with user-friendly messages

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS 4**: Utility-first CSS framework

### Libraries
- **@tanstack/react-table**: Modern table component library
- **recharts**: Charting library for data visualization
- **axios**: HTTP client for API requests
- **date-fns**: Date utility library

### Development Tools
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **Turbopack**: Fast bundler for development

## 📊 Portfolio Data Structure

The dashboard displays comprehensive stock information including:

| Field | Description | Source |
|-------|-------------|---------|
| Particulars | Stock Name | Portfolio Data |
| Purchase Price | Original purchase price | Portfolio Data |
| Quantity | Number of shares held | Portfolio Data |
| Investment | Purchase Price × Quantity | Calculated |
| Portfolio (%) | Proportional weight | Calculated |
| NSE/BSE | Stock Exchange Code | Portfolio Data |
| CMP | Current Market Price | Yahoo Finance API |
| Present Value | CMP × Quantity | Calculated |
| Gain/Loss | Present Value – Investment | Calculated |
| P/E Ratio | Price-to-Earnings Ratio | Google Finance API |
| Latest Earnings | Most recent earnings | Google Finance API |
| Sector | Business sector | Portfolio Data |

## 🔌 API Integration

### Financial Data Sources
- **Yahoo Finance**: Current Market Price (CMP)
- **Google Finance**: P/E Ratio and Latest Earnings

### Implementation Notes
- **Mock Implementation**: Current version uses simulated data for demonstration
- **Real API Integration**: Ready for integration with actual financial APIs
- **Rate Limiting**: Built-in handling for API rate limits and failures
- **Error Handling**: Comprehensive error handling for API failures

### Production API Options
1. **Yahoo Finance**: Use libraries like `yahoo-finance2` or implement web scraping
2. **Google Finance**: Use unofficial libraries or implement web scraping
3. **Alternative APIs**: Consider Alpha Vantage, IEX Cloud, or Polygon.io

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
portfolio-dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main page
│   │   └── globals.css        # Global styles
│   ├── components/             # React components
│   │   ├── PortfolioDashboard.tsx    # Main dashboard
│   │   ├── PortfolioOverview.tsx     # Summary cards
│   │   ├── PortfolioTable.tsx        # Holdings table
│   │   └── SectorSummary.tsx         # Sector breakdown
│   ├── services/               # Business logic
│   │   ├── financialApi.ts    # Financial data API
│   │   └── portfolioService.ts # Portfolio management
│   ├── types/                  # TypeScript definitions
│   │   └── portfolio.ts       # Portfolio interfaces
│   └── utils/                  # Utility functions
│       └── formatters.ts      # Data formatting
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for production configuration:

```env
# Financial API Keys (when integrating real APIs)
YAHOO_FINANCE_API_KEY=your_api_key
GOOGLE_FINANCE_API_KEY=your_api_key

# Update intervals (in milliseconds)
UPDATE_INTERVAL=15000
```

### Customization
- **Update Intervals**: Modify the refresh interval in `portfolioService.ts`
- **Styling**: Customize Tailwind classes or add custom CSS
- **Data Sources**: Replace mock data with real API calls
- **Portfolio Data**: Modify sample data in `portfolioService.ts`

## 📱 Responsive Design

The dashboard is fully responsive with:
- **Mobile First**: Optimized for small screens
- **Tablet Support**: Medium screen layouts
- **Desktop Experience**: Full-featured desktop interface
- **Dark Mode**: Automatic dark/light theme support

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
- **Netlify**: Build and deploy from Git
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

## 🔒 Security Considerations

- **API Keys**: Never expose API keys in client-side code
- **Rate Limiting**: Implement proper rate limiting for financial APIs
- **Data Validation**: Validate all incoming data
- **Error Handling**: Don't expose sensitive information in error messages

## 🧪 Testing

### Manual Testing
- Portfolio data loading
- Real-time updates
- Error handling scenarios
- Responsive design across devices

### Automated Testing (Future)
- Unit tests for services
- Component testing with React Testing Library
- E2E testing with Playwright
- API integration tests

## 🐛 Troubleshooting

### Common Issues

1. **Portfolio not loading**
   - Check browser console for errors
   - Verify all dependencies are installed
   - Clear browser cache

2. **Data not updating**
   - Check if auto-updates are enabled
   - Verify API service configuration
   - Check network connectivity

3. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check for CSS conflicts
   - Verify PostCSS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **TanStack**: For the powerful table component
- **Financial APIs**: For providing market data

## 📞 Support

For questions or support:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

---

**Note**: This is a demonstration project. For production use, integrate with real financial APIs and implement proper security measures.
