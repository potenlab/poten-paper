'use client';

import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, TrendingUp, DollarSign, CheckCircle, Star, Clock, Shield, Flame, Lightbulb } from 'lucide-react';
import type { IdeaValidationResult, ScoreDimension } from '@/lib/idea-validator/types';
import { DIMENSIONS } from '@/lib/idea-validator/types';

interface Props {
  result: IdeaValidationResult;
  onReset?: () => void;
}

const ICON_MAP: Record<string, any> = {
  'trending-up': TrendingUp,
  'dollar-sign': DollarSign,
  'check-circle': CheckCircle,
  star: Star,
  clock: Clock,
};

function scoreColor(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-[#0079FF]';
  if (score >= 4) return 'text-amber-600';
  return 'text-red-600';
}

function overallLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: '매우 유망', color: 'text-green-600' };
  if (score >= 70) return { label: '유망', color: 'text-[#0079FF]' };
  if (score >= 55) return { label: '괜찮음', color: 'text-amber-600' };
  if (score >= 40) return { label: '개선 필요', color: 'text-orange-600' };
  return { label: '재고 필요', color: 'text-red-600' };
}

export function IdeaResultView({ result, onReset }: Props) {
  const overall = overallLabel(result.overall_score);

  return (
    <div className="max-w-[820px] mx-auto px-4 sm:px-8 py-10">
      {/* Header */}
      <section className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0079FF]/10 text-[#0079FF] text-[13px] font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          검증 결과
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
          {result.summary}
        </h1>
        <div className={`inline-flex items-baseline gap-2 ${overall.color}`}>
          <span className="text-5xl sm:text-6xl font-bold" style={{ fontFamily: 'Clash Display Variable, sans-serif' }}>
            {result.overall_score}
          </span>
          <span className="text-xl font-semibold opacity-80">/ 100</span>
          <span className="ml-2 text-[13px] font-semibold opacity-80">· {overall.label}</span>
        </div>
      </section>

      {/* Scores — 5 dimensions */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
          5가지 지표
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {DIMENSIONS.map((dim: ScoreDimension) => {
            const Icon = ICON_MAP[dim.icon] || Sparkles;
            const s = (result.scores as any)[dim.key] ?? 0;
            return (
              <div
                key={dim.key}
                className="rounded-2xl border border-border bg-background p-5 text-center"
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${dim.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: dim.color }} />
                </div>
                <p className="text-[12px] text-muted-foreground mb-1">{dim.labelKo}</p>
                <p className={`text-2xl font-bold ${scoreColor(s)}`}>
                  {s.toFixed(1)}
                </p>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(s / 10) * 100}%`, backgroundColor: dim.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Blue & Red team */}
      <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#0079FF]/20 bg-[#0079FF]/5 p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-[#0079FF]" />
            <h3 className="text-[15px] font-bold text-[#0079FF]">Blue Team · 긍정 코칭</h3>
          </div>
          <p className="text-[14px] text-foreground/80 leading-relaxed whitespace-pre-line">
            {result.blue_team}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-red-600" />
            <h3 className="text-[15px] font-bold text-red-600">Red Team · 날카로운 반박</h3>
          </div>
          <p className="text-[14px] text-foreground/80 leading-relaxed whitespace-pre-line">
            {result.red_team}
          </p>
        </motion.div>
      </section>

      {/* Improvement tips */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          개선 제안
        </h2>
        <div className="rounded-2xl border border-border bg-background p-6">
          <ol className="space-y-3">
            {result.improvement_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#0079FF]/10 text-[#0079FF] text-[12px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-[14px] text-foreground/80 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Actions */}
      {onReset && (
        <section className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onReset}
            className="h-[48px] px-6 rounded-xl bg-background border border-border text-foreground text-[14px] font-semibold hover:bg-muted/50 transition-all inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> 다른 아이디어 검증
          </button>
        </section>
      )}
    </div>
  );
}
