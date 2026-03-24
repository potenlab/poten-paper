'use client';

import type { ChartData } from '@/lib/poten-paper/types';
import { CHART_COLORS } from '@/lib/poten-paper/constants';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieChartSectionProps {
  chart: ChartData;
}

export function PieChartSection({ chart }: PieChartSectionProps) {
  const isDonut = chart.type === 'donut';

  return (
    <div className="my-4 rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-800">
        {chart.title}
      </h4>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chart.data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={isDonut ? 55 : 0}
            paddingAngle={isDonut ? 3 : 0}
            label={({ name, percent }: any) =>
              `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
            fontSize={11}
          >
            {chart.data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chart.colors?.[index] ?? CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
