'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  FileText,
  ClipboardCheck,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  Target,
  Crosshair,
  Table2,
} from 'lucide-react';

const translations = {
  ko: {
    hero: {
      headline: '추상적인 아이디어를',
      headlineHighlight: '실행 가능한 계획으로',
      subheadline:
        '아이디어 진단부터 정부지원사업용 사업계획서까지, AI가 자동으로 작성해드립니다.',
      inputPlaceholder: '사업 아이디어를 자유롭게 설명해주세요...',
      ctaButton: '사업계획서 만들기',
    },
    features: {
      title: '사업 기획에 필요한 모든 것',
      subtitle: 'AI가 분석하고, 문서를 만들어드립니다',
      items: [
        {
          icon: 'lightbulb',
          title: '아이디어 검증',
          description:
            '사업 아이디어의 시장성·수익성·실현가능성을 AI가 분석하고 점수를 매깁니다.',
          link: '/idea-validator/new',
          highlight: false,
        },
        {
          icon: 'file',
          title: '사업계획서 자동 생성',
          description:
            'PSST 프레임워크로 정부지원사업 신청용 계획서 작성. TAM/SAM/SOM, SWOT, BM 캔버스까지 자동 시각화.',
          link: '/poten-paper/new',
          highlight: true,
        },
        {
          icon: 'shield',
          title: '사업계획서 검증',
          description:
            '작성한 사업계획서를 AI가 6지표로 분석. Blue/Red Team 피드백 + 개선 제안 제공.',
          link: '/poten-checker/new',
          highlight: false,
        },
      ],
    },
    process: {
      title: '이렇게 진행됩니다',
      steps: [
        {
          number: '01',
          title: '아이디어 입력',
          description: '만들고 싶은 서비스나 사업 아이디어를 자유롭게 설명하세요.',
        },
        {
          number: '02',
          title: 'AI 분석',
          description: 'AI가 시장, 경쟁사, 타겟 고객을 자동으로 리서치합니다.',
        },
        {
          number: '03',
          title: '문서 생성',
          description: '분석 결과를 바탕으로 구조화된 사업계획서가 생성됩니다.',
        },
        {
          number: '04',
          title: '수정 & 다운로드',
          description: '섹션별로 수정하고 PDF로 다운로드하세요.',
        },
      ],
    },
    cta: {
      title: '지금 바로 시작하세요',
      description: '복잡한 사업계획서, AI가 대신 써드립니다.',
      button: '무료로 시작하기',
    },
    footer: {
      copyright: '© 2026 포텐페이퍼. All rights reserved.',
    },
  },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lightbulb: Lightbulb,
  file: FileText,
  chart: TrendingUp,
  shield: ShieldCheck,
};

export default function PotenPaperLandingPage() {
  const [idea, setIdea] = useState('');
  const router = useRouter();
  const t = translations.ko;

  const handleStart = () => {
    const url = idea.trim()
      ? `/poten-paper/new?idea=${encodeURIComponent(idea.trim())}`
      : '/poten-paper/new';
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative px-6 pt-16 pb-16 md:pt-24 md:pb-20 bg-gradient-to-b from-[#14A697]/5 to-white">
        <div className="max-w-[1156px] mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4 leading-tight">
              {t.hero.headline}
              <br />
              <span className="bg-gradient-to-r from-[#14A697] to-[#0079FF] bg-clip-text text-transparent">
                {t.hero.headlineHighlight}
              </span>
            </h1>
            <p className="text-base md:text-lg text-[#666666] mb-8">
              {t.hero.subheadline}
            </p>

            <div className="relative max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.06)] border border-[#E7E7E7] p-1.5">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14A697]" />
                    <input
                      type="text"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleStart();
                      }}
                      placeholder={t.hero.inputPlaceholder}
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#FFFFFF] border border-[#E7E7E7] outline-none focus:border-[#14A697] transition-colors text-sm text-[#222222] placeholder:text-[#666666]"
                    />
                  </div>
                  <button
                    onClick={handleStart}
                    className="bg-gradient-to-r from-[#14A697] to-[#0079FF] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {t.hero.ctaButton}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-[1156px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3">
              {t.features.title}
            </h2>
            <p className="text-sm md:text-base text-[#666666]">{t.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {t.features.items.map((item, index) => {
              const Icon = iconMap[item.icon];
              return (
                <Link
                  key={index}
                  href={item.link}
                  className={`group rounded-xl p-6 transition-all duration-300 relative overflow-hidden block ${
                    item.highlight
                      ? 'bg-gradient-to-br from-[#14A697]/5 to-[#0079FF]/5 border-2 border-[#14A697] shadow-[0_4px_20px_rgba(20,166,151,0.12)] hover:shadow-[0_8px_30px_rgba(20,166,151,0.2)]'
                      : 'bg-white border border-[#E7E7E7] hover:border-[#14A697] hover:shadow-[0px_2px_8px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  {item.highlight && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#14A697] to-[#0079FF] text-white text-[10px] font-bold tracking-wide">
                      메인
                    </span>
                  )}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#14A697]/10 to-transparent rounded-bl-full" />
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#14A697] to-[#0079FF] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 flex items-center gap-1.5">
                      {item.title}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#14A697]" />
                    </h3>
                    <p className="text-sm text-[#666666] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="px-6 py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1156px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-12 text-center">
            {t.process.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {t.process.steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#14A697] to-[#0079FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{step.number}</span>
                </div>
                <h3 className="text-base font-bold text-[#1A1A1A] mb-2">{step.title}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini Tools — 무료 빠른 생성 */}
      <section className="px-6 py-16">
        <div className="max-w-[1156px] mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-[12px] font-semibold mb-3">
              <Sparkles className="w-3 h-3" />
              무료 · 30초
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3">
              빠르게 시작하는 미니 도구
            </h2>
            <p className="text-sm md:text-base text-[#666666]">
              사업계획서를 쓰기 전, 아이디어를 다양한 관점으로 검토해보세요
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                Icon: LayoutGrid,
                title: 'BM 캔버스',
                desc: '9블록 비즈니스 모델',
                link: '/bm-canvas/new',
              },
              {
                Icon: Target,
                title: 'SWOT 분석',
                desc: '강점·약점·기회·위협',
                link: '/swot/new',
              },
              {
                Icon: Crosshair,
                title: '포지셔닝맵',
                desc: '시장 내 우리 위치',
                link: '/positioning-map/new',
              },
              {
                Icon: Table2,
                title: '경쟁사 비교표',
                desc: '기능별 체크마크 대결',
                link: '/competitors/new',
              },
            ].map((tool, i) => {
              const Icon = tool.Icon;
              return (
                <Link
                  key={i}
                  href={tool.link}
                  className="group bg-white rounded-xl p-5 border border-[#E7E7E7] hover:border-[#0079FF] hover:shadow-[0px_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 block"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0079FF]/10 flex items-center justify-center mb-3 group-hover:bg-[#0079FF]/15 transition-colors">
                    <Icon className="w-5 h-5 text-[#0079FF]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A1A1A] mb-1 flex items-center gap-1">
                    {tool.title}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#0079FF]" />
                  </h3>
                  <p className="text-xs text-[#666666] leading-relaxed">{tool.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="max-w-[800px] mx-auto">
          <div className="bg-gradient-to-br from-[#14A697] to-[#0079FF] rounded-2xl p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t.cta.title}</h2>
            <p className="text-base text-white/90 mb-8">{t.cta.description}</p>
            <button
              onClick={() => router.push('/poten-paper/new')}
              className="inline-flex items-center gap-2 bg-white text-[#14A697] px-8 py-4 rounded-xl text-base font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              {t.cta.button}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-[#222222]">
        <div className="max-w-[1156px] mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-gradient-to-br from-[#0079FF] to-[#14A697] rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">포텐페이퍼</span>
          </div>
          <p className="text-xs text-[#666666]">{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
