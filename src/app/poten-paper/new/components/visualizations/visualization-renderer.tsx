'use client';

import type {
  VisualizationData,
  StatCard,
  SwotData,
  BmCanvasData,
  OrgChartMember,
  FlowStep,
  PositioningMapData,
  ComparisonGridData,
  PhaseCard,
} from '@/lib/poten-paper/types';

import { StatCards } from './stat-cards';
import { SwotAnalysis } from './swot-analysis';
import { BmCanvas } from './bm-canvas';
import { OrgChart } from './org-chart';
import { FlowDiagram } from './flow-diagram';
import { PositioningMap } from './positioning-map';
import { ComparisonGrid } from './comparison-grid';
import { PhaseCards } from './phase-cards';
import { InsightBox } from './insight-box';

interface VisualizationRendererProps {
  visualization: VisualizationData;
}

export function VisualizationRenderer({ visualization }: VisualizationRendererProps) {
  const { type, title, data } = visualization;

  switch (type) {
    case 'statCards':
      return <StatCards title={title} data={data as StatCard[]} />;
    case 'swot':
      return <SwotAnalysis title={title} data={data as SwotData} />;
    case 'bmCanvas':
      return <BmCanvas title={title} data={data as BmCanvasData} />;
    case 'orgChart':
      return <OrgChart title={title} data={data as OrgChartMember[]} />;
    case 'flowDiagram':
      return <FlowDiagram title={title} data={data as FlowStep[]} />;
    case 'positioningMap':
      return <PositioningMap title={title} data={data as PositioningMapData} />;
    case 'comparisonGrid':
      return <ComparisonGrid title={title} data={data as ComparisonGridData} />;
    case 'phaseCards':
      return <PhaseCards title={title} data={data as PhaseCard[]} />;
    case 'insightBox':
    case 'quoteBox':
      return <InsightBox type={type} title={title} data={data as { text: string; source?: string }} />;
    default:
      return null;
  }
}
