'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PortfolioTable } from './PortfolioTable';
import { PortfolioOverview } from './PortfolioOverview';
import { SectorSummaryComponent } from './SectorSummary';
import { portfolioService } from '@/services/portfolioService';
import { PortfolioData } from '@/types/portfolio';
import { getConfig } from '@/config/env';

export const PortfolioDashboard: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('Initializing...');
  const config = getConfig();

  // Fetch portfolio data
  const fetchPortfolioData = useCallback(async () => {
    try {
      setError(null);
      const data = portfolioService.getPortfolioData();
      setPortfolioData(data);
      setLastUpdated(portfolioService.getLastUpdateTime() || new Date());
    } catch (err) {
      setError('Failed to fetch portfolio data');
      console.error('Error fetching portfolio data:', err);
    }
  }, []);

  // Update financial data
  const updateFinancialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setUpdateStatus('Fetching real-time data from Yahoo Finance & Google Finance...');
      
      await portfolioService.fetchDataNow();
      await fetchPortfolioData();
      
      setUpdateStatus('Data updated successfully');
      setTimeout(() => setUpdateStatus(''), 3000); // Clear status after 3 seconds
    } catch (err) {
      setError('Failed to update financial data');
      setUpdateStatus('Update failed');
      console.error('Error updating financial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPortfolioData]);

  // (Import functionality removed for now)

  // Reset to sample data
  const handleResetToSample = useCallback(() => {
    try {
      setUpdateStatus('Resetting to sample data...');
      portfolioService.resetToSampleData();
      fetchPortfolioData();
      setError(null);
      setUpdateStatus('Reset to sample data completed');
      setTimeout(() => setUpdateStatus(''), 3000);
    } catch (err) {
      setError('Failed to reset portfolio data');
      setUpdateStatus('Reset failed');
      console.error('Error resetting portfolio:', err);
    }
  }, [fetchPortfolioData]);

  // Initialize portfolio
  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Fetch live CMP data on initial load
  useEffect(() => {
    updateFinancialData();
  }, [updateFinancialData]);

  // Auto-refresh during market hours
  useEffect(() => {
    const intervalMs = config.UPDATE_INTERVAL_MS;
    const timer = setInterval(async () => {
      try {
        if (portfolioService.isMarketOpen()) {
          setUpdateStatus('Auto-refresh: fetching latest market data...');
          await portfolioService.fetchDataNow();
          await fetchPortfolioData();
          setUpdateStatus('Auto-refresh completed');
          setLastUpdated(portfolioService.getLastUpdateTime() || new Date());
        } else {
          setUpdateStatus('Market closed. Auto-refresh paused.');
        }
      } catch (err) {
        console.error('Auto-refresh failed:', err);
        setUpdateStatus('Auto-refresh failed');
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [config.UPDATE_INTERVAL_MS, fetchPortfolioData]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    await updateFinancialData();
  }, [updateFinancialData]);

  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Portfolio Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time portfolio tracking with live market data from Yahoo Finance & Google Finance
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Status Bar */}
        {updateStatus && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {updateStatus}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          
          
          <button
            onClick={handleResetToSample}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset to Sample Data
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading || portfolioService.isUpdateInProgress()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || portfolioService.isUpdateInProgress() ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Fetch Data Now
              </>
            )}
          </button>
        </div>



        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Overview Cards */}
        <PortfolioOverview portfolioData={portfolioData} />

        {/* Portfolio Table */}
        <div className="mb-8">
          <PortfolioTable
            holdings={portfolioData.holdings}
            onRefresh={handleRefresh}
            isLoading={isLoading || portfolioService.isUpdateInProgress()}
          />
        </div>

        {/* Sector Summary */}
        <div className="mb-8">
          <SectorSummaryComponent sectorSummaries={portfolioData.sectorSummaries} />
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">
            Data is fetched manually when you click &quot;Fetch Data Now&quot; • {portfolioData.holdings.length} holdings loaded
          </p>
          <p className="text-xs mb-2">
            <strong>Data Sources:</strong> Yahoo Finance (CMP), Google Finance (P/E Ratio & Earnings)
          </p>
          <p className="text-xs">
            Note: Using unofficial APIs and web scraping. Data accuracy depends on source availability.
          </p>
        </div>
      </div>
    </div>
  );
};
