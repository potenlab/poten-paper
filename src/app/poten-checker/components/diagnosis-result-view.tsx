'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Heart,
  Flame,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { DiagnosisResult, RadarDataPoint } from '@/lib/poten-checker/types';
import { getScoreColor, getScoreBg } from '@/lib/poten-checker/utils';

interface DiagnosisResultViewProps {
  result: DiagnosisResult;
  children?: ReactNode;
}

export function DiagnosisResultView({ result, children }: DiagnosisResultViewProps) {
  const radarData: RadarDataPoint[] = result.dimensions.map((d) => ({
    dimension: d.labelKo,
    score: d.score,
    fullMark: 10,
  }));

  return (
    <>
      {/* Overall Score */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-8 mb-6">
        <div className="flex items-start gap-5 mb-8">
          <div
            className={`shrink-0 w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center ${getScoreBg(
              result.overallScore
            )}`}
          >
            <span className="text-3xl font-bold">{result.overallScore}</span>
            <span className="text-[11px] font-medium opacity-70">/10</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              종합 진단 결과
            </h2>
            <p className="text-[14px] text-muted leading-relaxed">
              {result.overallSummaryKo}
            </p>
          </div>
        </div>

        {/* Critical Warnings */}
        {result.criticalWarnings && result.criticalWarnings.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-700 dark:text-red-400 text-[15px]">
                치명적 리스크 경고
              </h3>
            </div>
            <ul className="space-y-1">
              {result.criticalWarnings.map((warning: string, i: number) => (
                <li
                  key={i}
                  className="text-[13px] text-red-600 dark:text-red-400 flex items-start gap-2"
                >
                  <span className="shrink-0 mt-0.5">-</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Radar Chart */}
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickCount={6}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dimension Detail Cards */}
      <div className="space-y-4 mb-6">
        {result.dimensions.map((dim) => (
          <motion.div
            key={dim.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-card rounded-xl border shadow-sm p-5 ${
              dim.score <= 3 ? 'border-red-200 dark:border-red-500/30' : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-[15px] text-foreground">
                {dim.labelKo}
              </h4>
              <span
                className="text-sm font-bold"
                style={{ color: getScoreColor(dim.score) }}
              >
                {dim.score}/10
              </span>
            </div>

            {/* Score bar */}
            <div className="w-full h-2 bg-card-secondary rounded-full mb-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(dim.score / 10) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: getScoreColor(dim.score) }}
              />
            </div>

            {/* Blue & Red Team Feedback */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Heart className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[12px] font-semibold text-blue-600 dark:text-blue-400">
                    따뜻한 조언
                  </span>
                </div>
                <p className="text-[12px] text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                  {dim.blueFeedbackKo}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Flame className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[12px] font-semibold text-red-600 dark:text-red-400">
                    레드팀 분석
                  </span>
                </div>
                <p className="text-[12px] text-red-700/80 dark:text-red-300/80 leading-relaxed">
                  {dim.redFeedbackKo}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* File info */}
      <div className="text-center text-[13px] text-disabled mb-8">
        {result.fileName} &middot;{' '}
        {new Date(result.analyzedAt).toLocaleString('ko-KR')}
      </div>

      {children}
    </>
  );
}
