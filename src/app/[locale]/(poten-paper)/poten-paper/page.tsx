'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  ScrollText,
  Upload,
  Lightbulb,
  Search,
  FileText,
  BarChart3,
  ArrowRight,
  ImageIcon,
  PenTool,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';

const BRAND_COLOR = '#0EA5E9';
const BRAND_COLOR_DARK = '#0284C7';

const PLAN_SECTIONS = [
  {
    icon: Target,
    title: '문제 정의 & 솔루션',
    desc: '해결하고자 하는 핵심 문제와 솔루션의 차별점을 명확하게 정리합니다.',
  },
  {
    icon: TrendingUp,
    title: '시장 분석 & 트렌드',
    desc: 'AI가 웹 리서치를 통해 TAM-SAM-SOM, 산업 트렌드, 시장 규모를 조사합니다.',
  },
  {
    icon: Users,
    title: '경쟁사 분석',
    desc: '주요 경쟁사와 비교 분석표를 자동 생성하고 진입 전략을 제안합니다.',
  },
  {
    icon: DollarSign,
    title: '비즈니스 모델 & 수익 구조',
    desc: '수익 모델, 단가 구조, 매출 전망을 체계적으로 구성합니다.',
  },
  {
    icon: Layers,
    title: '실행 계획 & 로드맵',
    desc: '개발 마일스톤, 출시 전략, KPI를 포함한 실행 로드맵을 작성합니다.',
  },
  {
    icon: ImageIcon,
    title: '시각 자료 가이드',
    desc: '각 섹션에 필요한 그래프, 차트, 다이어그램 종류와 구성을 안내합니다.',
  },
];

const STEPS = [
  {
    step: '01',
    icon: Lightbulb,
    title: '아이디어 입력',
    desc: '사업 아이디어를 입력하거나, 기존 PRD/문서를 업로드하세요.',
  },
  {
    step: '02',
    icon: Search,
    title: 'AI 리서치',
    desc: 'AI가 시장 분석, 경쟁사 조사, 산업 트렌드를 자동으로 리서치합니다.',
  },
  {
    step: '03',
    icon: PenTool,
    title: '사업계획서 생성',
    desc: 'CEO 가이드라인에 맞춰 섹션별 사업계획서 초안을 자동 생성합니다.',
  },
  {
    step: '04',
    icon: FileText,
    title: '검토 & 수정',
    desc: '생성된 초안을 검토하고, 섹션별로 재생성하거나 내보낼 수 있습니다.',
  },
];

const INPUT_OPTIONS = [
  {
    icon: Upload,
    title: 'PRD / 기존 문서 업로드',
    desc: 'PDF, DOCX 형식의 기존 문서를 업로드하면 AI가 분석하여 사업계획서로 변환합니다.',
    badge: 'PDF, DOCX 지원',
  },
  {
    icon: Lightbulb,
    title: '아이디어로 시작하기',
    desc: '사업명, 산업군, 타겟 고객, 문제/솔루션 등을 단계별로 입력하면 AI가 완성합니다.',
    badge: '가이드 폼 제공',
  },
];

export default function PotenPaperLandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleStart = () => {
    router.push('/poten-paper/new');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-transparent dark:from-sky-500/10 dark:to-transparent">
        <div className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px] py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold mb-6"
              style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}
            >
              <ScrollText className="w-4 h-4" />
              포텐페이퍼
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-6">
              AI 사업계획서 자동 생성
            </h1>
            <p className="text-lg text-muted leading-relaxed mb-4 max-w-2xl mx-auto">
              사업 아이디어만 있으면 충분합니다.
              <br className="hidden sm:block" />
              AI가 시장 조사부터 사업계획서 초안 작성까지
              <br className="hidden sm:block" />
              정부 지원사업 신청에 맞춰 자동으로 완성해 드립니다.
            </p>
            <p className="text-sm text-muted/70 mb-8">
              PRD 업로드 또는 아이디어 입력, 두 가지 방식으로 시작할 수 있습니다.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button
                onClick={handleStart}
                className="h-14 px-8 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all text-[16px] font-semibold"
                style={{ backgroundColor: BRAND_COLOR }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = BRAND_COLOR_DARK)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BRAND_COLOR)
                }
              >
                사업계획서 만들기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              {isAuthenticated && (
                <Button
                  onClick={() => router.push('/mypage?tab=poten-paper')}
                  variant="outline"
                  className="h-14 px-8 rounded-2xl text-[16px] font-semibold"
                >
                  <ScrollText className="w-5 h-5 mr-2" />
                  내 사업계획서
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Input Options Section */}
      <section className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px] py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">
            두 가지 방법으로 시작하세요
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            기존 문서가 있다면 업로드하고, 아이디어만 있다면 가이드 폼을 따라 입력하세요.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {INPUT_OPTIONS.map((opt, i) => (
            <motion.div
              key={opt.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="bg-card rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow text-center"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: `${BRAND_COLOR}15` }}
              >
                <opt.icon className="w-7 h-7" style={{ color: BRAND_COLOR }} />
              </div>
              <span
                className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4"
                style={{ backgroundColor: `${BRAND_COLOR}10`, color: BRAND_COLOR }}
              >
                {opt.badge}
              </span>
              <h3 className="font-bold text-lg text-foreground mb-2">
                {opt.title}
              </h3>
              <p className="text-[14px] text-muted leading-relaxed">
                {opt.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Plan Sections - What AI Generates */}
      <section className="bg-card-secondary py-20">
        <div className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              AI가 작성하는 사업계획서 구성
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              CEO 가이드라인을 기반으로 정부 지원사업 평가 기준에 맞는 사업계획서를 생성합니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLAN_SECTIONS.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${BRAND_COLOR}15` }}
                >
                  <section.icon className="w-6 h-6" style={{ color: BRAND_COLOR }} />
                </div>
                <h3 className="font-bold text-[17px] text-foreground mb-2">
                  {section.title}
                </h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  {section.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px] py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">
            이용 방법
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            4단계만 따라오시면 AI가 사업계획서 초안을 완성합니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="bg-card rounded-2xl p-6 text-center border border-border"
            >
              <div
                className="text-5xl font-black mb-4"
                style={{ color: `${BRAND_COLOR}25` }}
              >
                {item.step}
              </div>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${BRAND_COLOR}15` }}
              >
                <item.icon className="w-7 h-7" style={{ color: BRAND_COLOR }} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-[14px] text-muted">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Visual Guide Highlight */}
      <section className="bg-card-secondary py-20">
        <div className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${BRAND_COLOR}15` }}
            >
              <Sparkles className="w-8 h-8" style={{ color: BRAND_COLOR }} />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              시각 자료 가이드 포함
            </h2>
            <p className="text-muted leading-relaxed mb-6">
              각 섹션마다 어떤 그래프와 이미지를 넣어야 하는지 구체적으로 안내합니다.
              <br className="hidden sm:block" />
              그래프 유형, 축 구성, 데이터 포인트까지 - 평가자에게 어필하는 시각 자료를 쉽게 만들 수 있습니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { label: '라인 차트', example: '매출 성장 추이' },
                { label: '비교 매트릭스', example: '경쟁사 기능 비교' },
                { label: '플로우 다이어그램', example: '서비스 운영 구조' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${BRAND_COLOR}10` }}
                  >
                    <BarChart3 className="w-5 h-5" style={{ color: BRAND_COLOR }} />
                  </div>
                  <p className="font-semibold text-sm text-foreground">{item.label}</p>
                  <p className="text-[12px] text-muted mt-1">{item.example}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-20"
        style={{
          background: `linear-gradient(to right, ${BRAND_COLOR}, ${BRAND_COLOR_DARK})`,
        }}
      >
        <div className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              지금 바로 사업계획서를 만들어 보세요
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              AI가 시장 조사부터 초안 작성까지, 정부 지원사업에 맞는 사업계획서를 자동으로 완성합니다.
            </p>
            <Button
              onClick={handleStart}
              className="h-14 px-10 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all text-[16px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-200"
              style={{ color: BRAND_COLOR }}
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
