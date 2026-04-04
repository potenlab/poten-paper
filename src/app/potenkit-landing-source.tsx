import { useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import {
  Sparkles, FileText, DollarSign, ListChecks, Layout, ClipboardCheck, Briefcase,
  ArrowRight, Globe, Target, Zap, GraduationCap
} from 'lucide-react';

const translations = {
  ko: {
    brand: 'PotenKit',
    hero: {
      headline: '아이디어에서 실행까지',
      headlineHighlight: '궁극의 IT 기획 키트',
      subheadline: 'PRD, 견적, 와이어프레임, 화면정의서를 단 몇 분만에.',
      inputPlaceholder: '만들고 싶은 서비스를 자유롭게 설명해주세요...',
      ctaButton: '무료로 시작하기'
    },
    process: {
      title: '이렇게 진행됩니다',
      subtitle: '아이디어를 현실로 만드는 6단계',
      steps: [
        {
          badge: '1단계',
          title: 'AI PRD 생성',
          description: 'AI가 여러분의 아이디어를 분석해 제품 요구사항 문서를 자동으로 작성합니다.',
          status: 'active',
          route: 'potenkit-prd-new'
        },
        {
          badge: '2단계',
          title: '실시간 견적',
          description: '개발 시간과 난이도를 분석해 투명한 비용을 바로 확인할 수 있습니다.',
          status: 'active',
          route: 'potenkit-estimator'
        },
        {
          badge: '3단계',
          title: '기능 명세서',
          description: '개발팀에 바로 전달 가능한 상세한 기능 명세서가 자동으로 만들어집니다.',
          status: 'coming'
        },
        {
          badge: '4단계',
          title: 'AI 와이어프레임',
          description: 'AI가 화면 구성과 사용자 흐름을 시각적으로 만들어줍니다.',
          status: 'active',
          route: 'potenkit-ui-builder'
        },
        {
          badge: '5단계',
          title: '화면설계서',
          description: '각 화면의 기능 명세와 상세 설명이 포함된 정식 설계 문서를 생성합니다.',
          status: 'coming'
        },
        {
          badge: '6단계',
          title: '개발 & 구축',
          description: '완성된 기획을 바탕으로 실제 서비스를 개발하고 구축합니다.',
          status: 'active',
          route: 'contact'
        }
      ]
    },
    value: {
      title: '기획은 고객이, 개발은 우리가',
      subtitle: '이제 프로젝트 진행 과정을 직접 확인하고 결정하세요',
      description: '그동안 외주 개발을 맡기면 "어떤 개념으로", "어떤 흐름으로" 만들어지는지 알 수 없었습니다. PotenKit은 이 모든 과정을 투명하게 공개하고, 고객이 직접 기획에 참여할 수 있게 만들었습니다.',
      features: [
        { title: '투명한 프로세스', description: '모든 기획 단계를 실시간으로 확인하고 수정할 수 있어요' },
        { title: '합리적인 가격', description: '필요한 기능만 선택해서 정확한 비용을 미리 알 수 있어요' },
        { title: '빠른 의사결정', description: '기획부터 견적까지 몇 분이면 충분합니다' }
      ]
    },
    cta: {
      title: '어떻게 시작하시겠어요?',
      subtitle: '직접 배워서 만들거나, 전문가에게 맡기거나',
      pathA: {
        badge: '스스로 만들기',
        title: 'PotenKit 아카데미',
        description: 'IT 기획과 개발의 기초부터 실전까지. 현업 전문가가 알려주는 노하우를 배워보세요.',
        features: [
          '기획부터 개발까지 A to Z 커리큘럼',
          '바로 써먹는 실전 프로젝트 템플릿',
          '현업 개발자 멘토링',
          '수료증 발급'
        ],
        button: '아카데미 살펴보기'
      },
      pathB: {
        badge: '전문가에게 맡기기',
        title: 'Potenlab 개발팀',
        description: '기획부터 운영까지 전 과정을 전문가가 책임집니다. 여러분은 기획에만 집중하세요.',
        features: [
          '전담 프로젝트 매니저 배정',
          '경력 5년 이상 개발팀',
          '철저한 QA 테스팅',
          '출시 후 6개월 무상 유지보수'
        ],
        button: '프로젝트 의뢰하기'
      }
    },
    footer: {
      copyright: '© 2026 PotenKit. All rights reserved.'
    }
  },
  en: {
    brand: 'PotenKit',
    hero: {
      headline: 'From Idea to Execution',
      headlineHighlight: 'The Ultimate IT Planning Kit',
      subheadline: 'Generate PRDs, quotes, wireframes, and screen specs in just minutes.',
      inputPlaceholder: 'Describe your service idea here...',
      ctaButton: 'Start for Free'
    },
    process: {
      title: 'How It Works',
      subtitle: 'Six steps to turn your idea into reality',
      steps: [
        {
          badge: 'Step 1',
          title: 'AI PRD Generation',
          description: 'AI analyzes your idea and automatically creates a Product Requirement Document.',
          status: 'active',
          route: 'potenkit-prd-new'
        },
        {
          badge: 'Step 2',
          title: 'Instant Quote',
          description: 'Get transparent pricing instantly based on development time and complexity.',
          status: 'active',
          route: 'potenkit-estimator'
        },
        {
          badge: 'Step 3',
          title: 'Functional Specs',
          description: 'Detailed feature specifications are automatically generated for your dev team.',
          status: 'coming'
        },
        {
          badge: 'Step 4',
          title: 'AI Wireframes',
          description: 'AI generates screen layouts and user flows visually.',
          status: 'active',
          route: 'potenkit-ui-builder'
        },
        {
          badge: 'Step 5',
          title: 'Screen Spec Document',
          description: 'Generate formal design documents with detailed feature specs for each screen.',
          status: 'coming'
        },
        {
          badge: 'Step 6',
          title: 'Development & Build',
          description: 'Build and launch your actual service based on the completed planning.',
          status: 'active',
          route: 'contact'
        }
      ]
    },
    value: {
      title: 'You Plan, We Build',
      subtitle: 'Now you can see and control every step of your project',
      description: 'For too long, outsourcing development meant losing visibility into "how" and "why" things were built. PotenKit makes the entire process transparent and puts you in control of the planning.',
      features: [
        { title: 'Transparent Process', description: 'See and modify every planning stage in real-time' },
        { title: 'Fair Pricing', description: 'Choose only what you need and know the exact cost upfront' },
        { title: 'Quick Decisions', description: 'From planning to quote in just minutes' }
      ]
    },
    cta: {
      title: 'How Would You Like to Start?',
      subtitle: 'Learn and build yourself, or leave it to the experts',
      pathA: {
        badge: 'DIY Path',
        title: 'PotenKit Academy',
        description: 'From IT planning basics to advanced development. Learn from industry professionals.',
        features: [
          'A to Z curriculum from planning to dev',
          'Real-world project templates',
          'Expert developer mentoring',
          'Certificate of completion'
        ],
        button: 'Explore Academy'
      },
      pathB: {
        badge: 'Expert Path',
        title: 'Potenlab Dev Team',
        description: 'Experts handle everything from planning to operation. You focus only on the planning.',
        features: [
          'Dedicated project manager',
          '5+ years experienced dev team',
          'Rigorous QA testing',
          '6 months free maintenance'
        ],
        button: 'Request Project'
      }
    },
    footer: {
      copyright: '© 2026 PotenKit. All rights reserved.'
    }
  }
};

export default function PotenKitLandingPage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const { navigate } = useRouter();
  const t = translations[lang];

  const handleStepClick = (step: any) => {
    if (step.external) {
      window.open(step.external, '_blank');
    } else if (step.route) {
      navigate(step.route as any);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E7E7E7]">
        <div className="max-w-[1156px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0079FF] to-[#14A697] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-[#222222]">{t.brand}</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <span className="text-sm text-[#0079FF] font-semibold">
                {lang === 'ko' ? 'IT 기획' : 'IT Planning'}
              </span>
              <button
                onClick={() => navigate('potenkit-business' as any)}
                className="text-sm text-[#666666] hover:text-[#0079FF] transition-colors"
              >
                {lang === 'ko' ? '사업 기획' : 'Business'}
              </button>
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

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-[1156px] mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4 leading-tight">
              {t.hero.headline}
              <br />
              <span className="bg-gradient-to-r from-[#0079FF] to-[#14A697] bg-clip-text text-transparent">
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
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0079FF]" />
                    <input
                      type="text"
                      placeholder={t.hero.inputPlaceholder}
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#FFFFFF] border border-[#E7E7E7] outline-none focus:border-[#0079FF] transition-colors text-sm text-[#222222] placeholder:text-[#666666]"
                    />
                  </div>
                  <button
                    onClick={() => navigate('potenkit-prd-new' as any)}
                    className="bg-gradient-to-r from-[#0079FF] to-[#14A697] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
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

      {/* Process Flow - 6 Steps */}
      <section id="features" className="px-6 py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1156px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3">{t.process.title}</h2>
            <p className="text-sm md:text-base text-[#666666]">{t.process.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.process.steps.map((step, index) => {
              const icons = [FileText, DollarSign, ListChecks, Layout, ClipboardCheck, Briefcase];
              const Icon = icons[index];
              const isComing = step.status === 'coming';

              return (
                <div
                  key={index}
                  onClick={() => !isComing && handleStepClick(step)}
                  className={`group bg-white rounded-xl p-6 border border-[#E7E7E7] transition-all duration-300 relative overflow-hidden ${
                    isComing ? 'opacity-75' : 'hover:border-[#0079FF] hover:shadow-[0px_2px_8px_rgba(0,0,0,0.06)] cursor-pointer'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#0079FF]/10 to-transparent rounded-bl-full" />
                  <div className="relative">
                    <div className={`w-12 h-12 bg-gradient-to-br from-[#0079FF] to-[#14A697] rounded-xl flex items-center justify-center mb-4 transition-transform ${
                      !isComing ? 'group-hover:scale-110' : ''
                    }`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="inline-block px-2.5 py-0.5 bg-[#0079FF]/10 text-[#0079FF] rounded-full text-xs font-semibold">
                        {step.badge}
                      </div>
                      {isComing && (
                        <div className="inline-block px-2.5 py-0.5 bg-[#00ff99]/10 text-[#14A697] rounded-full text-xs font-semibold">
                          {lang === 'ko' ? '준비중' : 'Coming Soon'}
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#666666] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section id="about" className="px-6 py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[1156px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3">{t.value.title}</h2>
            <p className="text-sm md:text-base text-[#666666] max-w-2xl mx-auto">{t.value.subtitle}</p>
          </div>

          <div className="bg-gradient-to-br from-[#0079FF]/5 to-[#14A697]/5 rounded-xl p-8 md:p-10 mb-8">
            <p className="text-sm md:text-base text-[#333333] leading-relaxed text-center max-w-3xl mx-auto">
              {t.value.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.value.features.map((feature, index) => {
              const icons = [Target, DollarSign, Zap];
              const Icon = icons[index];
              return (
                <div key={index} className="bg-white rounded-xl p-6 border border-[#E7E7E7] hover:border-[#0079FF] hover:shadow-[0px_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0079FF] to-[#14A697] rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-[#1A1A1A] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#666666] leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dual CTA */}
      <section id="pricing" className="px-6 py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1156px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3">{t.cta.title}</h2>
            <p className="text-sm md:text-base text-[#666666]">{t.cta.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Path A: Education */}
            <div className="group relative bg-white rounded-xl p-8 border-2 border-[#E7E7E7] hover:border-[#0079FF] transition-all duration-300 hover:shadow-[0px_2px_8px_rgba(0,0,0,0.06)]">
              <div className="absolute top-6 right-6">
                <GraduationCap className="w-12 h-12 text-[#0079FF]/10 group-hover:text-[#0079FF]/20 transition-colors" />
              </div>
              <div className="relative">
                <div className="inline-block px-3 py-1.5 bg-[#0079FF]/10 text-[#0079FF] rounded-full text-xs font-semibold mb-4">
                  {t.cta.pathA.badge}
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{t.cta.pathA.title}</h3>
                <p className="text-sm text-[#666666] mb-6 leading-relaxed">{t.cta.pathA.description}</p>
                <ul className="space-y-3 mb-8">
                  {t.cta.pathA.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-[#0079FF]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-[#0079FF] rounded-full" />
                      </div>
                      <span className="text-sm text-[#333333]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('poten-school' as any)}
                  className="w-full bg-gradient-to-r from-[#0079FF] to-[#14A697] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  {t.cta.pathA.button}
                  <GraduationCap className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Path B: Agency */}
            <div className="group relative bg-gradient-to-br from-[#0079FF] to-[#14A697] rounded-xl p-8 border-2 border-[#0079FF] transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="absolute top-6 right-6">
                <Briefcase className="w-12 h-12 text-white/10 group-hover:text-white/20 transition-colors" />
              </div>
              <div className="relative">
                <div className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-semibold mb-4">
                  {t.cta.pathB.badge}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t.cta.pathB.title}</h3>
                <p className="text-sm text-white/90 mb-6 leading-relaxed">{t.cta.pathB.description}</p>
                <ul className="space-y-3 mb-8">
                  {t.cta.pathB.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-[#00ff99] rounded-full" />
                      </div>
                      <span className="text-sm text-white/90">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('contact' as any)}
                  className="w-full bg-white text-[#0079FF] px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  {t.cta.pathB.button}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
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
