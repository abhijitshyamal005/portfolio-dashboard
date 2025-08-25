import { StockHolding, PortfolioData, SectorSummary } from '@/types/portfolio';
import { fetchFinancialData } from './financialApi';

// Sample portfolio data - in a real app, this would come from a database
const SAMPLE_PORTFOLIO: StockHolding[] = [
  {
    id: '1',
    particulars: 'RELIANCE',
    purchasePrice: 2400.00,
    quantity: 100,
    investment: 240000.00,
    portfolioPercentage: 0,
    exchange: 'NSE',
    sector: 'Oil & Gas',
    cmp: 2450.75,
    presentValue: 245075.00,
    gainLoss: 5075.00,
    peRatio: 18.5,
    latestEarnings: 125.50,
    lastUpdated: new Date()
  },
  {
    id: '2',
    particulars: 'TCS',
    purchasePrice: 3800.00,
    quantity: 50,
    investment: 190000.00,
    portfolioPercentage: 0,
    exchange: 'NSE',
    sector: 'Technology',
    cmp: 3850.25,
    presentValue: 192512.50,
    gainLoss: 2512.50,
    peRatio: 25.2,
    latestEarnings: 95.75,
    lastUpdated: new Date()
  },
  {
    id: '3',
    particulars: 'INFY',
    purchasePrice: 1400.00,
    quantity: 75,
    investment: 105000.00,
    portfolioPercentage: 0,
    exchange: 'NSE',
    sector: 'Technology',
    cmp: 1450.50,
    presentValue: 108787.50,
    gainLoss: 3787.50,
    peRatio: 22.8,
    latestEarnings: 78.25,
    lastUpdated: new Date()
  },
  {
    id: '4',
    particulars: 'HDFC',
    purchasePrice: 1600.00,
    quantity: 60,
    investment: 96000.00,
    portfolioPercentage: 0,
    exchange: 'NSE',
    sector: 'Financial Services',
    cmp: 1650.00,
    presentValue: 99000.00,
    gainLoss: 3000.00,
    peRatio: 19.8,
    latestEarnings: 112.50,
    lastUpdated: new Date()
  },
  {
    id: '5',
    particulars: 'ICICIBANK',
    purchasePrice: 900.00,
    quantity: 100,
    investment: 90000.00,
    portfolioPercentage: 0,
    exchange: 'NSE',
    sector: 'Financial Services',
    cmp: 950.75,
    presentValue: 95075.00,
    gainLoss: 5075.00,
    peRatio: 16.5,
    latestEarnings: 68.75,
    lastUpdated: new Date()
  },
  {
    id: '6',
    particulars: 'WIPRO',
    purchasePrice: 440.00,
    quantity: 200,
    investment: 88000.00,
    portfolioPercentage: 0,
    exchange: 'NSE',
    sector: 'Technology',
    cmp: 450.25,
    presentValue: 90050.00,
    gainLoss: 2050.00,
    peRatio: 20.1,
    latestEarnings: 45.50,
    lastUpdated: new Date()
  },
  {
    id: '7',
    particulars: 'TATAMOTORS',
    purchasePrice: 720.00,
    quantity: 120,
    investment: 86400.00,
    portfolioPercentage: 0,
    exchange: 'NSE',
    sector: 'Automobile',
    cmp: 750.50,
    presentValue: 90060.00,
    gainLoss: 3660.00,
    peRatio: 28.5,
    latestEarnings: 35.25,
    lastUpdated: new Date()
  },
  {
    id: '8',
    particulars: 'AXISBANK',
    purchasePrice: 820.00,
    quantity: 100,
    investment: 82000.00,
    portfolioPercentage: 0,
    exchange: 'NSE',
    sector: 'Financial Services',
    cmp: 850.00,
    presentValue: 85000.00,
    gainLoss: 3000.00,
    peRatio: 17.2,
    latestEarnings: 58.90,
    lastUpdated: new Date()
  }
];

export class PortfolioService {
  private holdings: StockHolding[] = [...SAMPLE_PORTFOLIO];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.calculatePortfolioPercentages();
  }

  // Calculate portfolio percentages based on investment amounts
  private calculatePortfolioPercentages(): void {
    const totalInvestment = this.holdings.reduce((sum, holding) => sum + holding.investment, 0);
    
    this.holdings.forEach(holding => {
      holding.portfolioPercentage = (holding.investment / totalInvestment) * 100;
    });
  }

  // Update portfolio with imported data
  updatePortfolioWithImportedData(importedHoldings: StockHolding[]): void {
    this.holdings = [...importedHoldings];
    this.calculatePortfolioPercentages();
  }

  // Reset to sample data
  resetToSampleData(): void {
    this.holdings = [...SAMPLE_PORTFOLIO];
    this.calculatePortfolioPercentages();
  }

  // Update financial data for all holdings
  async updateFinancialData(): Promise<void> {
    const updatePromises = this.holdings.map(async (holding) => {
      try {
        const financialData = await fetchFinancialData(holding.particulars);
        
        if (financialData.success && financialData.data) {
          holding.cmp = financialData.data.cmp;
          holding.peRatio = financialData.data.peRatio;
          holding.latestEarnings = financialData.data.latestEarnings;
          holding.presentValue = holding.cmp * holding.quantity;
          holding.gainLoss = holding.presentValue - holding.investment;
          holding.lastUpdated = financialData.data.lastUpdated;
        }
      } catch (error) {
        console.error(`Failed to update data for ${holding.particulars}:`, error);
      }
    });

    await Promise.all(updatePromises);
  }

  // Get current portfolio data
  getPortfolioData(): PortfolioData {
    const totalInvestment = this.holdings.reduce((sum, holding) => sum + holding.investment, 0);
    const totalPresentValue = this.holdings.reduce((sum, holding) => sum + holding.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercentage = (totalInvestment > 0) ? (totalGainLoss / totalInvestment) * 100 : 0;

    // Group by sector
    const sectorMap = new Map<string, SectorSummary>();
    
    this.holdings.forEach(holding => {
      if (!sectorMap.has(holding.sector)) {
        sectorMap.set(holding.sector, {
          sector: holding.sector,
          totalInvestment: 0,
          totalPresentValue: 0,
          totalGainLoss: 0,
          stockCount: 0
        });
      }
      
      const sectorSummary = sectorMap.get(holding.sector)!;
      sectorSummary.totalInvestment += holding.investment;
      sectorSummary.totalPresentValue += holding.presentValue;
      sectorSummary.totalGainLoss += holding.gainLoss;
      sectorSummary.stockCount += 1;
    });

    const sectorSummaries = Array.from(sectorMap.values());

    return {
      holdings: [...this.holdings],
      sectorSummaries,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercentage
    };
  }

  // Start automatic updates
  startAutoUpdates(intervalMs: number = 15000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(async () => {
      await this.updateFinancialData();
    }, intervalMs);
  }

  // Stop automatic updates
  stopAutoUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Add new holding
  addHolding(holding: Omit<StockHolding, 'id' | 'portfolioPercentage' | 'cmp' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings' | 'lastUpdated'>): void {
    const newHolding: StockHolding = {
      ...holding,
      id: Date.now().toString(),
      portfolioPercentage: 0,
      cmp: 0,
      presentValue: 0,
      gainLoss: 0,
      peRatio: 0,
      latestEarnings: 0,
      lastUpdated: new Date()
    };
    
    this.holdings.push(newHolding);
    this.calculatePortfolioPercentages();
  }

  // Remove holding
  removeHolding(id: string): void {
    this.holdings = this.holdings.filter(holding => holding.id !== id);
    this.calculatePortfolioPercentages();
  }

  // Update holding
  updateHolding(id: string, updates: Partial<StockHolding>): void {
    const index = this.holdings.findIndex(holding => holding.id === id);
    if (index !== -1) {
      this.holdings[index] = { ...this.holdings[index], ...updates };
      this.calculatePortfolioPercentages();
    }
  }

  // Get current holdings count
  getHoldingsCount(): number {
    return this.holdings.length;
  }

  // Check if portfolio has data
  hasData(): boolean {
    return this.holdings.length > 0;
  }
}

// Export singleton instance
export const portfolioService = new PortfolioService();
