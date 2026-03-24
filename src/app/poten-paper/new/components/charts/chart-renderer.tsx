'use client';

import type { ChartData } from '@/lib/poten-paper/types';
import { BarChartSection } from './bar-chart-section';
import { HorizontalBarChart } from './horizontal-bar-chart';
import { PieChartSection } from './pie-chart-section';
import { LineChartSection } from './line-chart-section';
import { FunnelChart } from './funnel-chart';
import { DataTable } from './data-table';
import { TimelineTable } from './timeline-table';

interface ChartRendererProps {
  chart: ChartData;
}

export function ChartRenderer({ chart }: ChartRendererProps) {
  switch (chart.type) {
    case 'bar':
      return <BarChartSection chart={chart} />;
    case 'horizontalBar':
      return <HorizontalBarChart chart={chart} />;
    case 'pie':
    case 'donut':
      return <PieChartSection chart={chart} />;
    case 'line':
      return <LineChartSection chart={chart} />;
    case 'funnel':
      return <FunnelChart chart={chart} />;
    case 'table':
      return <DataTable chart={chart} />;
    case 'timeline':
      return <TimelineTable chart={chart} />;
    default:
      return null;
  }
}
