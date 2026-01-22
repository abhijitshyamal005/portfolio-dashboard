'use client';

import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface CandlestickData {
  name: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  height?: number;
}

// Custom shape for candlestick
interface CandlestickShapeProps {
  x?: number;
  y?: number;
  width?: number;
  payload?: CandlestickData;
}

const CandlestickShape = (props: CandlestickShapeProps) => {
  const { x = 0, y = 0, width = 0, payload } = props;
  if (!payload) return null;
  const { open, high, low, close } = payload;
  const isUp = close >= open;
  const bodyHeight = Math.abs(close - open);
  const wickTop = Math.max(high, open, close);
  const wickBottom = Math.min(low, open, close);
  
  const bodyY = isUp ? y - bodyHeight : y;
  const wickTopY = y - (wickTop - Math.max(open, close));
  const wickBottomY = y - (wickBottom - Math.min(open, close));
  
  const color = isUp ? '#10B981' : '#EF4444';
  
  return (
    <g>
      {/* Wick (vertical line) */}
      <line
        x1={x + width / 2}
        y1={wickTopY}
        x2={x + width / 2}
        y2={wickBottomY}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body (rectangle) */}
      <rect
        x={x + width * 0.2}
        y={bodyY}
        width={width * 0.6}
        height={Math.max(bodyHeight, 2)}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, height = 300 }) => {
  // Transform data to include calculated values for visualization
  const chartData = data.map((item) => ({
    ...item,
    // Calculate body range
    bodyTop: Math.max(item.open, item.close),
    bodyBottom: Math.min(item.open, item.close),
    // For bar visualization
    range: item.high - item.low,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="name" 
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: '1px solid #374151',
            borderRadius: '8px'
          }}
          formatter={(value: number | string, name: string) => {
            if (name === 'open' || name === 'high' || name === 'low' || name === 'close') {
              const numValue = typeof value === 'number' ? value : parseFloat(String(value));
              return [numValue.toFixed(2), name.toUpperCase()];
            }
            return [value, name];
          }}
        />
        {/* Custom candlestick visualization using bars */}
        <Bar
          dataKey="high"
          fill="transparent"
          shape={<CandlestickShape />}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
