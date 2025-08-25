'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PortfolioOverview } from './PortfolioOverview';
import { PortfolioTable } from './PortfolioTable';
import { SectorSummaryComponent } from './SectorSummary';
import { FileUpload } from './FileUpload';
import { portfolioService } from '@/services/portfolioService';
import { PortfolioData, StockHolding } from '@/types/portfolio';

export const PortfolioDashboard: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Fetch portfolio data
  const fetchPortfolioData = useCallback(async () => {
    try {
      setError(null);
      const data = portfolioService.getPortfolioData();
      setPortfolioData(data);
      setLastUpdated(new Date());
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
      await portfolioService.updateFinancialData();
      await fetchPortfolioData();
    } catch (err) {
      setError('Failed to update financial data');
      console.error('Error updating financial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPortfolioData]);

  // Handle imported portfolio data
  const handleImportedPortfolio = useCallback((holdings: StockHolding[]) => {
    try {
      portfolioService.updatePortfolioWithImportedData(holdings);
      fetchPortfolioData();
      setShowFileUpload(false);
      setError(null);
    } catch (err) {
      setError('Failed to import portfolio data');
      console.error('Error importing portfolio:', err);
    }
  }, [fetchPortfolioData]);

  // Reset to sample data
  const handleResetToSample = useCallback(() => {
    try {
      portfolioService.resetToSampleData();
      fetchPortfolioData();
      setError(null);
    } catch (err) {
      setError('Failed to reset portfolio data');
      console.error('Error resetting portfolio:', err);
    }
  }, [fetchPortfolioData]);

  // Initialize portfolio and start auto-updates
  useEffect(() => {
    fetchPortfolioData();
    
    // Start automatic updates every 15 seconds
    portfolioService.startAutoUpdates(15000);
    
    // Cleanup on unmount
    return () => {
      portfolioService.stopAutoUpdates();
    };
  }, [fetchPortfolioData]);

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
            Real-time portfolio tracking with live market data
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {showFileUpload ? 'Hide File Upload' : 'Import Excel File'}
          </button>
          
          <button
            onClick={handleResetToSample}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset to Sample Data
          </button>
        </div>

        {/* File Upload Section */}
        {showFileUpload && (
          <FileUpload onPortfolioData={handleImportedPortfolio} />
        )}

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
            isLoading={isLoading}
          />
        </div>

        {/* Sector Summary */}
        <div className="mb-8">
          <SectorSummaryComponent sectorSummaries={portfolioData.sectorSummaries} />
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">
            Data updates automatically every 15 seconds • {portfolioData.holdings.length} holdings loaded
          </p>
          <p className="text-xs">
            Note: This is a demonstration using mock data. In production, real-time data would be fetched from financial APIs.
          </p>
        </div>
      </div>
    </div>
  );
};
