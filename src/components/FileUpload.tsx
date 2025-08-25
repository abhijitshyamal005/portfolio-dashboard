'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { StockHolding } from '@/types/portfolio';

interface FileUploadProps {
  onPortfolioData: (holdings: StockHolding[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onPortfolioData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await readExcelFile(file);
      const holdings = convertToPortfolioData(data);
      onPortfolioData(holdings);
    } catch (err) {
      setError('Failed to read Excel file. Please check the format.');
      console.error('Error reading file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const readExcelFile = (file: File): Promise<unknown[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData as unknown[][]);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const convertToPortfolioData = (excelData: unknown[][]): StockHolding[] => {
    const holdings: StockHolding[] = [];
    
    // Skip header row and process data rows
    for (let i = 1; i < excelData.length; i++) {
      const row = excelData[i];
      
      // Skip empty rows or sector summary rows
      if (!row[1] || row[1] === '') continue;
      
      // Check if this is a sector summary row (usually has "Total" or similar)
      if (typeof row[1] === 'string' && 
          (row[1].toLowerCase().includes('total') || 
           row[1].toLowerCase().includes('summary'))) {
        continue;
      }

      try {
        const holding: StockHolding = {
          id: `imported-${i}`,
          particulars: String(row[1] || ''), // Stock Name
          purchasePrice: parseFloat(String(row[2])) || 0, // Purchase Price
          quantity: parseInt(String(row[3])) || 0, // Quantity
          investment: parseFloat(String(row[4])) || 0, // Investment
          portfolioPercentage: 0, // Will be calculated
          exchange: String(row[5] || 'NSE'), // NSE/BSE
          sector: String(row[6] || 'Others'), // Sector
          cmp: parseFloat(String(row[7])) || 0, // CMP
          presentValue: parseFloat(String(row[8])) || 0, // Present Value
          gainLoss: parseFloat(String(row[9])) || 0, // Gain/Loss
          peRatio: parseFloat(String(row[10])) || 0, // P/E Ratio
          latestEarnings: parseFloat(String(row[11])) || 0, // Latest Earnings
          lastUpdated: new Date()
        };

        // Only add if we have essential data
        if (holding.particulars && holding.purchasePrice > 0 && holding.quantity > 0) {
          holdings.push(holding);
        }
      } catch (err) {
        console.warn(`Failed to parse row ${i}:`, row, err);
      }
    }

    // Calculate portfolio percentages
    const totalInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);
    holdings.forEach(holding => {
      holding.portfolioPercentage = (holding.investment / totalInvestment) * 100;
    });

    return holdings;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Import Portfolio from Excel
        </h3>
        
        <div className="flex items-center justify-center">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Choose Excel File
              </>
            )}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Supported formats: .xlsx, .xls</p>
          <p className="mt-1">Expected columns: Stock Name, Purchase Price, Quantity, Investment, NSE/BSE, CMP, Present Value, Gain/Loss, P/E Ratio, Latest Earnings, Sector</p>
        </div>
      </div>
    </div>
  );
};
