'use client';

import type { ChartData } from '@/lib/poten-paper/types';
import { BRAND_COLOR } from '@/lib/poten-paper/constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface HorizontalBarChartProps {
  chart: ChartData;
}

export function HorizontalBarChart({ chart }: HorizontalBarChartProps) {
  return (
    <div className="my-4 rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-800">
        {chart.title}
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={chart.data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#D1D5DB' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#D1D5DB' }}
            tickLine={false}
            width={100}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
          <Bar
            dataKey="value"
            fill={BRAND_COLOR}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
