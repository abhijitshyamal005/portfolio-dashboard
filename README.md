# Portfolio Dashboard

A dynamic, real-time portfolio dashboard built with Next.js, TypeScript, and Tailwind CSS that provides live insights into portfolio performance by fetching data from financial APIs.

## ✨ Features

- **📊 Real-time Portfolio Tracking**: Live stock prices, P/E ratios, and earnings data
- **🔄 Automatic Updates**: Data refreshes every 15 seconds during market hours
- **📈 Performance Metrics**: Gain/loss calculations, portfolio percentages, sector summaries
- **📁 Excel Import**: Import portfolio data from XLSX files
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS
- **⚡ Server-side APIs**: No CORS issues - reliable data fetching
- **🛡️ Bulletproof Fallbacks**: Multiple fallback mechanisms ensure 100% uptime

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd portfolio-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create `.env.local` in the project root (see [Setup Instructions](./SETUP_INSTRUCTIONS.md))

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` (or the port shown in terminal)

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

### Backend
- **Next.js API Routes** for server-side data fetching
- **Yahoo Finance API** for real-time stock prices
- **Google Finance** for P/E ratios and earnings
- **Intelligent caching** and rate limiting

