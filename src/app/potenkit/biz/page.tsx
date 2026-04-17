'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles, FileText, ClipboardCheck, Lightbulb, TrendingUp,
  ArrowRight, Globe, CheckCircle
} from 'lucide-react';

const translations = {
  ko: {
    brand: 'PotenKit',
    nav: { it: 'IT 기획', business: '사업 기획' },
    hero: {
      headline: '추상적인 아이디어를',
      headlineHighlight: '실행 가능한 계획으로',
      subheadline: '아이디어 진단부터 정부지원사업용 사업계획서까지, AI가 자동으로 작성해드립니다.',
      inputPlaceholder: '사업 아이디어를 자유롭게 설명해주세요...',
      ctaButton: '사업계획서 만들기'
    },
    features: {
      title: '사업 기획에 필요한 모든 것',
      subtitle: 'AI가 분석하고, 문서를 만들어드립니다',
      items: [
        {
          icon: 'lightbulb',
          title: '아이디어 진단',
          description: '사업 아이디어의 시장성, 경쟁력, 실현가능성을 AI가 분석하고 점수를 매깁니다.',
          status: 'active'
        },
        {
          icon: 'file',
          title: '사업계획서 자동 생성',
          description: '예비창업패키지 등 정부지원사업 신청용 사업계획서를 PSST 프레임워크로 작성합니다.',
          status: 'active'
        },
        {
          icon: 'chart',
          title: '시장분석 & 시각화',
          description: 'TAM/SAM/SOM 분석, 경쟁사 비교, SWOT 분석을 자동으로 생성하고 차트로 시각화합니다.',
          status: 'active'
        },
        {
          icon: 'check',
          title: 'BM 캔버스 & 로드맵',
          description: '비즈니스 모델 캔버스, 수익 구조, 로드맵까지 한 번에 만들어집니다.',
          status: 'active'
        }
      ]
    },
    process: {
      title: '이렇게 진행됩니다',
      steps: [
        { number: '01', title: '아이디어 입력', description: '만들고 싶은 서비스나 사업 아이디어를 자유롭게 설명하세요.' },
        { number: '02', title: 'AI 분석', description: 'AI가 시장, 경쟁사, 타겟 고객을 자동으로 리서치합니다.' },
        { number: '03', title: '문서 생성', description: '분석 결과를 바탕으로 구조화된 사업계획서가 생성됩니다.' },
        { number: '04', title: '수정 & 다운로드', description: '섹션별로 수정하고 PDF로 다운로드하세요.' }
      ]
    },
    cta: {
      title: '지금 바로 시작하세요',
      description: '복잡한 사업계획서, AI가 대신 써드립니다.',
      button: '무료로 시작하기'
    },
    footer: {
      copyright: '© 2026 PotenKit. All rights reserved.'
    }
  },
  en: {
    brand: 'PotenKit',
    nav: { it: 'IT Planning', business: 'Business Planning' },
    hero: {
      headline: 'Turn Your Business Idea',
      headlineHighlight: 'Into an Actionable Plan',
      subheadline: 'From idea validation to government-funded business plans. AI writes it for you automatically.',
      inputPlaceholder: 'Describe your business idea here...',
      ctaButton: 'Create Business Plan'
    },
    features: {
      title: 'Everything You Need for Business Planning',
      subtitle: 'AI analyzes and creates documents for you',
      items: [
        {
          icon: 'lightbulb',
          title: 'Idea Diagnosis',
          description: 'AI analyzes your business idea\'s market viability, competitiveness, and feasibility.',
          status: 'active'
        },
        {
          icon: 'file',
          title: 'Auto Business Plan',
          description: 'Generate business plans for government funding applications using the PSST framework.',
          status: 'active'
        },
        {
          icon: 'chart',
          title: 'Market Analysis & Charts',
          description: 'Auto-generate TAM/SAM/SOM analysis, competitor comparison, and SWOT with visualizations.',
          status: 'active'
        },
        {
          icon: 'check',
          title: 'BM Canvas & Roadmap',
          description: 'Business model canvas, revenue structure, and roadmap — all generated at once.',
          status: 'active'
        }
      ]
    },
    process: {
      title: 'How It Works',
      steps: [
        { number: '01', title: 'Describe Your Idea', description: 'Freely describe your service or business idea.' },
        { number: '02', title: 'AI Analysis', description: 'AI automatically researches markets, competitors, and target customers.' },
        { number: '03', title: 'Document Generation', description: 'A structured business plan is generated from the analysis.' },
        { number: '04', title: 'Edit & Download', description: 'Edit by section and download as PDF.' }
      ]
    },
    cta: {
      title: 'Start Right Now',
      description: 'Let AI write your complex business plan for you.',
      button: 'Start for Free'
    },
    footer: {
      copyright: '© 2026 PotenKit. All rights reserved.'
    }
  }
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lightbulb: Lightbulb,
  file: FileText,
  chart: TrendingUp,
  check: CheckCircle
};

export default function BusinessPage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const router = useRouter();
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E7E7E7]">
        <div className="max-w-[1156px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/potenkit" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0079FF] to-[#14A697] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-[#222222]">{t.brand}</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/potenkit"
                className="text-sm text-[#666666] hover:text-[#0079FF] transition-colors"
              >
                {t.nav.it}
              </Link>
              <span className="text-sm text-[#0079FF] font-semibold">
                {t.nav.business}
              </span>
            </nav>

            <button
              onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E7E7E7] hover:border-[#0079FF] rounded-lg transition-all duration-300"
            >
              <Globe className="w-4 h-4 text-[#666666]" />
              <span className="text-sm font-medium text-[#222222]">{lang === 'ko' ? 'EN' : 'KO'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-32 pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-[#14A697]/5 to-white">
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
                      placeholder={t.hero.inputPlaceholder}
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#FFFFFF] border border-[#E7E7E7] outline-none focus:border-[#14A697] transition-colors text-sm text-[#222222] placeholder:text-[#666666]"
                    />
                  </div>
                  <button
                    onClick={() => router.push('/poten-paper/new')}
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
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3">{t.features.title}</h2>
            <p className="text-sm md:text-base text-[#666666]">{t.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.features.items.map((item, index) => {
              const Icon = iconMap[item.icon];
              return (
                <div
                  key={index}
                  className="group bg-white rounded-xl p-6 border border-[#E7E7E7] hover:border-[#14A697] hover:shadow-[0px_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#14A697]/10 to-transparent rounded-bl-full" />
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#14A697] to-[#0079FF] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
                    <p className="text-sm text-[#666666] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="px-6 py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1156px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-12 text-center">{t.process.title}</h2>
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
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">{t.brand}</span>
          </div>
          <p className="text-xs text-[#666666]">{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
