export interface StockHolding {
  id: string;
  particulars: string; // Stock Name
  purchasePrice: number;
  quantity: number;
  investment: number; // Purchase Price × Qty
  portfolioPercentage: number; // Proportional weight in portfolio
  exchange: string; // NSE/BSE
  sector: string;
  cmp: number; // Current Market Price from Yahoo Finance
  presentValue: number; // CMP × Qty
  gainLoss: number; // Present Value – Investment
  peRatio: number; // P/E Ratio from Google Finance
  latestEarnings: number; // Latest Earnings from Google Finance
  lastUpdated: Date;
  marketCap?: number; // Market Cap (optional)
  flagged?: boolean; // For special highlight (optional)
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  stockCount: number;
}

export interface PortfolioData {
  holdings: StockHolding[];
  sectorSummaries: SectorSummary[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
}

export interface FinancialData {
  cmp: number;
  peRatio: number;
  latestEarnings: number;
  lastUpdated: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
