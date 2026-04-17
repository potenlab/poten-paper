'use client';

import { useState } from 'react';
import { Check, Sparkles, ArrowRight, Info } from 'lucide-react';

type Billing = 'monthly' | 'yearly';

interface Plan {
  name: string;
  description: string;
  priceMonthly: number;
  features: string[];
  highlight?: boolean;
  ctaLabel: string;
  ctaDisabled: boolean;
}

const PLANS: Plan[] = [
  {
    name: '기본',
    description: '서비스를 처음 경험해보는 분',
    priceMonthly: 0,
    features: [
      '포텐 커뮤니티 일부 접근',
      '포텐 체커 월 1회',
      '포텐 페이퍼 월 1회',
      '뉴스 AI 요약',
    ],
    ctaLabel: '현재 플랜',
    ctaDisabled: true,
  },
  {
    name: 'Standard',
    description: '본격적으로 사업계획을 다듬는 분',
    priceMonthly: 19900,
    features: [
      '포텐 커뮤니티 전체 접근',
      '포텐 체커 월 10회',
      '포텐 페이퍼 월 5회',
      '지원 프로그램 알림',
    ],
    highlight: true,
    ctaLabel: '준비중',
    ctaDisabled: true,
  },
  {
    name: 'Premium',
    description: '프로페셔널 창업가를 위한',
    priceMonthly: 29900,
    features: [
      'Standard 전체 포함',
      '포텐 페이퍼 무제한',
      '1:1 전문가 컨설팅 (월 1회)',
      '프리미엄 네트워킹 이벤트',
    ],
    ctaLabel: '출시 예정',
    ctaDisabled: true,
  },
];

function formatPrice(monthly: number, billing: Billing) {
  if (monthly === 0) return 0;
  return billing === 'yearly' ? Math.round(monthly * 0.9) : monthly;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('monthly');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-6 pt-16 pb-12 bg-gradient-to-b from-[#14A697]/5 to-white">
        <div className="max-w-[1156px] mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4 leading-tight">
            <span className="bg-gradient-to-r from-[#14A697] to-[#0079FF] bg-clip-text text-transparent">
              포텐페이퍼
            </span>{' '}
            요금제
          </h1>
          <p className="text-base md:text-lg text-[#666666] max-w-2xl mx-auto mb-8">
            파운더의 성장 단계에 맞는 플랜을 선택하세요. 결제 · 구독은 더포텐셜에서 관리됩니다.
          </p>

          {/* Beta banner */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            베타 기간 · 로그인만 하면 모든 기능 무료
          </div>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-gray-100 border border-[#E7E7E7]">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billing === 'monthly'
                  ? 'bg-white text-[#1A1A1A] shadow-sm'
                  : 'text-[#666666]'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-1.5 ${
                billing === 'yearly'
                  ? 'bg-white text-[#1A1A1A] shadow-sm'
                  : 'text-[#666666]'
              }`}
            >
              연간
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#14A697]/10 text-[#14A697] font-bold">
                10% 할인
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 pb-20">
        <div className="max-w-[1156px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => {
              const price = formatPrice(plan.priceMonthly, billing);
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-7 border transition-all ${
                    plan.highlight
                      ? 'border-[#14A697] bg-gradient-to-br from-[#14A697]/5 to-[#0079FF]/5 shadow-[0_8px_30px_rgba(20,166,151,0.15)]'
                      : 'border-[#E7E7E7] bg-white'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#14A697] to-[#0079FF] text-white text-xs font-bold">
                      추천
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">{plan.name}</h3>
                    <p className="text-sm text-[#666666]">{plan.description}</p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-[#E7E7E7]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[#1A1A1A]">
                        {price.toLocaleString()}
                      </span>
                      <span className="text-base text-[#666666]">원</span>
                      <span className="text-sm text-[#999999] ml-1">/월</span>
                    </div>
                    {billing === 'yearly' && plan.priceMonthly > 0 && (
                      <p className="text-xs text-[#14A697] font-medium mt-1">
                        연간 결제 · 10% 할인 적용
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-7">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.highlight ? 'bg-[#14A697]/15' : 'bg-gray-100'
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 ${
                              plan.highlight ? 'text-[#14A697]' : 'text-[#666666]'
                            }`}
                          />
                        </div>
                        <span className="text-sm text-[#333333] leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    disabled={plan.ctaDisabled}
                    className={`w-full h-11 rounded-xl text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 ${
                      plan.ctaDisabled
                        ? 'bg-gray-100 text-[#999999] cursor-not-allowed'
                        : plan.highlight
                        ? 'bg-gradient-to-r from-[#14A697] to-[#0079FF] text-white hover:shadow-lg'
                        : 'bg-[#1A1A1A] text-white hover:bg-black'
                    }`}
                  >
                    {plan.ctaLabel}
                    {!plan.ctaDisabled && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Info note */}
          <div className="mt-10 max-w-3xl mx-auto flex items-start gap-3 p-5 rounded-xl bg-gray-50 border border-[#E7E7E7]">
            <Info className="w-5 h-5 text-[#666666] mt-0.5 shrink-0" />
            <div className="text-sm text-[#666666] leading-relaxed">
              요금제 · 결제 · 환불은 모두 <strong className="text-[#1A1A1A]">더포텐셜</strong>에서 관리됩니다.
              현재 포텐페이퍼는 베타 기간으로, 로그인만 하면 모든 기능을 무료로 이용하실 수 있습니다.
              정식 런칭 시 위 요금제가 적용될 예정이에요.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
