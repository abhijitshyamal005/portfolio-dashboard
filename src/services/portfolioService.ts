import { StockHolding, SectorSummary, PortfolioData } from '@/types/portfolio';
import { fetchBatchFinancialData, rateLimitedFetchFinancialData } from '@/services/financialApi';

// Sample portfolio data
const SAMPLE_PORTFOLIO: StockHolding[] = [
  {
    id: '1',
    particulars: 'TCS',
    purchasePrice: 3200,
    quantity: 100,
    investment: 320000,
    portfolioPercentage: 25.0,
    exchange: 'NSE',
    cmp: 0, // Will be fetched from API
    presentValue: 0, // Will be calculated
    gainLoss: 0, // Will be calculated
    peRatio: 0, // Will be fetched from API
    latestEarnings: 0, // Will be fetched from API
    sector: 'Technology',
    lastUpdated: new Date()
  },
  {
    id: '2',
    particulars: 'RELIANCE',
    purchasePrice: 2400,
    quantity: 50,
    investment: 120000,
    portfolioPercentage: 9.4,
    exchange: 'NSE',
    cmp: 0,
    presentValue: 0,
    gainLoss: 0,
    peRatio: 0,
    latestEarnings: 0,
    sector: 'Oil & Gas',
    lastUpdated: new Date()
  },
  {
    id: '3',
    particulars: 'INFY',
    purchasePrice: 1400,
    quantity: 150,
    investment: 210000,
    portfolioPercentage: 16.4,
    exchange: 'NSE',
    cmp: 0,
    presentValue: 0,
    gainLoss: 0,
    peRatio: 0,
    latestEarnings: 0,
    sector: 'Technology',
    lastUpdated: new Date()
  },
  {
    id: '4',
    particulars: 'HDFC',
    purchasePrice: 1600,
    quantity: 80,
    investment: 128000,
    portfolioPercentage: 10.0,
    exchange: 'NSE',
    cmp: 0,
    presentValue: 0,
    gainLoss: 0,
    peRatio: 0,
    latestEarnings: 0,
    sector: 'Banking & Financial',
    lastUpdated: new Date()
  },
  {
    id: '5',
    particulars: 'ICICIBANK',
    purchasePrice: 900,
    quantity: 120,
    investment: 108000,
    portfolioPercentage: 8.4,
    exchange: 'NSE',
    cmp: 0,
    presentValue: 0,
    gainLoss: 0,
    peRatio: 0,
    latestEarnings: 0,
    sector: 'Banking & Financial',
    lastUpdated: new Date()
  },
  {
    id: '6',
    particulars: 'TATAMOTORS',
    purchasePrice: 700,
    quantity: 200,
    investment: 140000,
    portfolioPercentage: 10.9,
    exchange: 'NSE',
    cmp: 0,
    presentValue: 0,
    gainLoss: 0,
    peRatio: 0,
    latestEarnings: 0,
    sector: 'Automobile',
    lastUpdated: new Date()
  },
  {
    id: '7',
    particulars: 'AXISBANK',
    purchasePrice: 800,
    quantity: 100,
    investment: 80000,
    portfolioPercentage: 6.3,
    exchange: 'NSE',
    cmp: 0,
    presentValue: 0,
    gainLoss: 0,
    peRatio: 0,
    latestEarnings: 0,
    sector: 'Banking & Financial',
    lastUpdated: new Date()
  },
  {
    id: '8',
    particulars: 'WIPRO',
    purchasePrice: 400,
    quantity: 300,
    investment: 120000,
    portfolioPercentage: 9.4,
    exchange: 'NSE',
    cmp: 0,
    presentValue: 0,
    gainLoss: 0,
    peRatio: 0,
    latestEarnings: 0,
    sector: 'Technology',
    lastUpdated: new Date()
  }
];

class PortfolioService {
  private portfolio: StockHolding[] = [...SAMPLE_PORTFOLIO];
  private lastUpdateTime: Date | null = null;
  private updateInProgress: boolean = false;

  // Get current portfolio
  getPortfolio(): StockHolding[] {
    return [...this.portfolio];
  }

  // Get portfolio data with calculations
  getPortfolioData(): PortfolioData {
    const totalInvestment = this.portfolio.reduce((sum, holding) => sum + holding.investment, 0);
    const totalPresentValue = this.portfolio.reduce((sum, holding) => sum + holding.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalReturnPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

    return {
      holdings: this.portfolio,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercentage: totalReturnPercentage,
      sectorSummaries: this.getSectorSummaries()
    };
  }

  // Get sector summaries
  getSectorSummaries(): SectorSummary[] {
    const sectorMap = new Map<string, SectorSummary>();

    this.portfolio.forEach(holding => {
      const existing = sectorMap.get(holding.sector);
      if (existing) {
        existing.totalInvestment += holding.investment;
        existing.totalPresentValue += holding.presentValue;
        existing.totalGainLoss += holding.gainLoss;
        existing.stockCount += 1;
      } else {
        sectorMap.set(holding.sector, {
          sector: holding.sector,
          totalInvestment: holding.investment,
          totalPresentValue: holding.presentValue,
          totalGainLoss: holding.gainLoss,
          stockCount: 1
        });
      }
    });

    return Array.from(sectorMap.values()).sort((a, b) => b.totalInvestment - a.totalInvestment);
  }

  // Update portfolio with imported data
  updatePortfolioWithImportedData(newHoldings: StockHolding[]): void {
    this.portfolio = newHoldings.map(holding => ({
      ...holding,
      cmp: 0,
      presentValue: 0,
      gainLoss: 0,
      peRatio: 0,
      latestEarnings: 0
    }));
    
    // Trigger immediate data fetch for the new portfolio
    this.updateFinancialData();
  }

  // Reset to sample data
  resetToSampleData(): void {
    this.portfolio = [...SAMPLE_PORTFOLIO];
    this.lastUpdateTime = null;
    
    // Trigger immediate data fetch for sample portfolio
    this.updateFinancialData();
  }

  // Manual data fetch - user controlled
  async fetchDataNow(): Promise<void> {
    if (this.updateInProgress) {
      console.log('Data fetch already in progress...');
      return;
    }

    this.updateInProgress = true;
    console.log('Starting manual data fetch...');
    
    try {
      await this.updateFinancialData();
      console.log('Manual data fetch completed successfully!');
    } catch (error) {
      console.error('Manual data fetch failed:', error);
    } finally {
      this.updateInProgress = false;
    }
  }

  // Update financial data for all holdings
  private async updateFinancialData(): Promise<void> {
    if (this.updateInProgress) {
      console.log('Update already in progress, skipping...');
      return;
    }

    this.updateInProgress = true;
    const startTime = Date.now();

    try {
      // Get all unique symbols
      const symbols = this.portfolio.map(holding => holding.particulars);
      
      // Fetch data in batches for efficiency
      const financialDataMap = await fetchBatchFinancialData(symbols);
      
      // Update portfolio with new data
      this.portfolio = this.portfolio.map(holding => {
        const financialData = financialDataMap.get(holding.particulars);
        
        if (financialData) {
          const presentValue = financialData.cmp * holding.quantity;
          const gainLoss = presentValue - holding.investment;
          
          return {
            ...holding,
            cmp: financialData.cmp,
            presentValue,
            gainLoss,
            peRatio: financialData.peRatio,
            latestEarnings: financialData.latestEarnings
          };
        }
        
        return holding;
      });

      this.lastUpdateTime = new Date();
      
      const duration = Date.now() - startTime;
      console.log(`Financial data update completed in ${duration}ms`);
      console.log(`Updated: ${financialDataMap.size}, Errors: 0, Total: ${symbols.length}`);
      
    } catch (error) {
      console.error('Error updating financial data:', error);
      
      // Fallback to individual API calls if batch fails
      console.log('Falling back to individual API calls...');
      await this.updateIndividualHoldings();
      
    } finally {
      this.updateInProgress = false;
    }
  }

  // Fallback: Update holdings individually
  private async updateIndividualHoldings(): Promise<void> {
    const updatePromises = this.portfolio.map(async (holding) => {
      try {
        const data = await rateLimitedFetchFinancialData(() => 
          fetchBatchFinancialData([holding.particulars])
        );
        if (data && data.has(holding.particulars)) {
          const financialData = data.get(holding.particulars)!;
          const presentValue = financialData.cmp * holding.quantity;
          const gainLoss = presentValue - holding.investment;
          
          Object.assign(holding, {
            cmp: financialData.cmp,
            presentValue,
            gainLoss,
            peRatio: financialData.peRatio,
            latestEarnings: financialData.latestEarnings
          });
        }
      } catch (error) {
        console.error(`Failed to update ${holding.particulars}:`, error);
      }
    });

    await Promise.allSettled(updatePromises);
    this.lastUpdateTime = new Date();
  }

  // Get last update time
  getLastUpdateTime(): Date | null {
    return this.lastUpdateTime;
  }

  // Check if update is in progress
  isUpdateInProgress(): boolean {
    return this.updateInProgress;
  }

  // Force update (for manual refresh)
  async forceUpdate(): Promise<void> {
    console.log('Force update requested...');
    await this.fetchDataNow();
  }

  // Get current time for display
  getCurrentTime(): Date {
    return new Date();
  }

  // Check if market is open (Indian market hours: 9:15 AM - 3:30 PM IST, Mon-Fri)
  isMarketOpen(): boolean {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST
    
    // Check if it's a weekday (Monday = 1, Sunday = 0)
    if (istTime.getDay() === 0 || istTime.getDay() === 6) {
      return false;
    }
    
    const currentHour = istTime.getHours();
    const currentMinute = istTime.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const marketStart = 9 * 60 + 15; // 9:15 AM
    const marketEnd = 15 * 60 + 30;  // 3:30 PM
    
    return currentTime >= marketStart && currentTime <= marketEnd;
  }
}

// Export singleton instance
export const portfolioService = new PortfolioService();
