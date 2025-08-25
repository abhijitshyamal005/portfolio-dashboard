'use client';

import React from 'react';
import { SectorSummary as SectorSummaryType } from '@/types/portfolio';
import { formatCompactCurrency } from '@/utils/formatters';

interface SectorSummaryProps {
  sectorSummaries: SectorSummaryType[];
}

export const SectorSummaryComponent: React.FC<SectorSummaryProps> = ({
  sectorSummaries,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sector Summary
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sector
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stocks
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Investment
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Present Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Return %
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sectorSummaries.map((sector) => {
              const returnPercentage = (sector.totalGainLoss / sector.totalInvestment) * 100;
              const isPositive = sector.totalGainLoss >= 0;
              
              return (
                <tr key={sector.sector} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {sector.sector}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                    {sector.stockCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-gray-900 dark:text-white">
                    {formatCompactCurrency(sector.totalInvestment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-semibold text-gray-900 dark:text-white">
                    {formatCompactCurrency(sector.totalPresentValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-semibold">
                    <span className={isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {isPositive ? '+' : ''}{formatCompactCurrency(sector.totalGainLoss)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-semibold">
                    <span className={isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {isPositive ? '+' : ''}{returnPercentage.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
