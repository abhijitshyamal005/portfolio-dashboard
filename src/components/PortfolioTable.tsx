'use client';

import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { StockHolding } from '@/types/portfolio';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters';

interface PortfolioTableProps {
  holdings: StockHolding[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<StockHolding>();

export const PortfolioTable: React.FC<PortfolioTableProps> = ({
  holdings,
  onRefresh,
  isLoading = false,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('particulars', {
        header: 'Particulars',
        cell: (info) => (
          <div className="font-semibold text-gray-900 dark:text-white">
            {info.getValue()}
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('purchasePrice', {
        header: 'Purchase Price',
        cell: (info) => (
          <div className="text-right font-mono">
            {formatCurrency(info.getValue())}
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('quantity', {
        header: 'Quantity',
        cell: (info) => (
          <div className="text-right font-mono">
            {formatNumber(info.getValue())}
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('investment', {
        header: 'Investment',
        cell: (info) => (
          <div className="text-right font-mono font-semibold">
            {formatCurrency(info.getValue())}
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('portfolioPercentage', {
        header: 'Portfolio (%)',
        cell: (info) => (
          <div className="text-right font-mono">
            {formatPercentage(info.getValue())}
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('exchange', {
        header: 'NSE/BSE',
        cell: (info) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {info.getValue()}
            </span>
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('cmp', {
        header: 'CMP',
        cell: (info) => (
          <div className="text-right font-mono font-semibold text-gray-900 dark:text-white">
            {formatCurrency(info.getValue())}
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('presentValue', {
        header: 'Present Value',
        cell: (info) => (
          <div className="text-right font-mono font-semibold">
            {formatCurrency(info.getValue())}
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('gainLoss', {
        header: 'Gain/Loss',
        cell: (info) => {
          const value = info.getValue();
          const isPositive = value >= 0;
          return (
            <div className={`text-right font-mono font-semibold ${
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isPositive ? '+' : ''}{formatCurrency(value)}
            </div>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor('peRatio', {
        header: 'P/E Ratio',
        cell: (info) => (
          <div className="text-right font-mono">
            {info.getValue() > 0 ? info.getValue().toFixed(1) : '-'}
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('latestEarnings', {
        header: 'Latest Earnings',
        cell: (info) => (
          <div className="text-right font-mono">
            {info.getValue() > 0 ? formatCurrency(info.getValue()) : '-'}
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor('sector', {
        header: 'Sector',
        cell: (info) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {info.getValue()}
            </span>
          </div>
        ),
        enableSorting: true,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: holdings,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Portfolio Holdings
          </h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isLoading ? (
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
                Refresh
              </>
            )}
          </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      {header.column.getCanSort() && (
                        <span className="ml-1">
                          {{
                            asc: '↑',
                            desc: '↓',
                          }[header.column.getIsSorted() as string] ?? '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {holdings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No holdings found</p>
        </div>
      )}
    </div>
  );
};
