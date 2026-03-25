'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Upload,
  BarChart3,
  FileSearch,
  ArrowRight,
} from 'lucide-react';
import { DIAGNOSIS_DIMENSIONS } from '@/lib/poten-checker/types';

export default function PotenCheckerLandingPage() {
  const router = useRouter();

  const handleStartDiagnosis = () => {
    router.push('/poten-checker/new');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F3FF] to-transparent dark:from-[#8B5CF6]/10 dark:to-transparent">
        <div className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px] py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[13px] font-semibold mb-6">
              <ShieldCheck className="w-4 h-4" />
              포텐 체커
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-6">
              AI 사업계획서 성공 예측
            </h1>
            <p className="text-lg text-muted leading-relaxed mb-8 max-w-2xl mx-auto">
              사업계획서를 업로드하면 AI가 6가지 핵심 지표로 분석하고, 따뜻한
              조언(Blue Team)과 날카로운 레드팀(Red Team) 두 가지 관점의 피드백을
              동시에 제공합니다.
            </p>
            <Button
              onClick={handleStartDiagnosis}
              className="h-14 px-8 rounded-2xl bg-[#8B5CF6] hover:bg-[#7c3aed] text-white shadow-lg hover:shadow-xl transition-all text-[16px] font-semibold"
            >
              진단 시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features - 6 Dimensions */}
      <section className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px] py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">
            6가지 핵심 평가 지표
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            AI가 사업계획서를 투자자 관점에서 엄격하고 논리적으로 분석합니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIAGNOSIS_DIMENSIONS.map((dim, i) => (
            <motion.div
              key={dim.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <h3 className="font-bold text-[17px] text-foreground mb-1">
                {dim.labelKo}
              </h3>
              <p className="text-[13px] text-[#8B5CF6] font-medium mb-2">
                {getDimensionQuestion(dim.key)}
              </p>
              <p className="text-[14px] text-muted leading-relaxed">
                {getDimensionDesc(dim.key)}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
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
              이용 방법
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Upload,
                title: '파일 업로드',
                desc: 'PDF, DOC, DOCX 형식의 사업계획서를 업로드하세요.',
              },
              {
                step: '02',
                icon: FileSearch,
                title: 'AI 분석',
                desc: 'AI가 6가지 핵심 지표로 사업계획서를 분석합니다.',
              },
              {
                step: '03',
                icon: BarChart3,
                title: '결과 확인',
                desc: '레이더 차트, Blue/Red Team 양면 피드백, 치명적 리스크 경고까지 확인하세요.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="bg-card rounded-2xl p-8 text-center border border-border"
              >
                <div className="text-[#8B5CF6]/20 text-5xl font-black mb-4">
                  {item.step}
                </div>
                <div className="w-14 h-14 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-[#8B5CF6]" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-[14px] text-muted">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] py-20">
        <div className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              지금 바로 사업계획서를 진단해 보세요
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              AI가 30초 만에 사업계획서의 강점과 약점을 분석해 드립니다.
            </p>
            <Button
              onClick={handleStartDiagnosis}
              className="h-14 px-10 rounded-2xl bg-white text-[#8B5CF6] hover:bg-gray-50 dark:hover:bg-gray-200 shadow-lg hover:shadow-xl transition-all text-[16px] font-semibold"
            >
              무료 진단 시작
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}

function getDimensionQuestion(key: string): string {
  const map: Record<string, string> = {
    market: '"파이가 충분히 큰가?"',
    edge: '"왜 이 제품이어야 하는가?"',
    feasibility: '"당신이 이걸 만들 수 있는가?"',
    bm: '"지속적으로 돈이 되는가?"',
    storytelling: '"논리적으로 설득되는가?"',
    readability: '"읽기 편하고 명확한가?"',
  };
  return map[key] || '';
}

function getDimensionDesc(key: string): string {
  const map: Record<string, string> = {
    market:
      '타겟 고객의 규모(TAM-SAM-SOM)와 성장성, 고객의 실제 지불 의사 여부를 검증합니다.',
    edge: '기존 대안 대비 압도적 우위, 카피캣 방지 전략 및 진입 장벽을 평가합니다.',
    feasibility:
      '창업자/팀의 역량, 기술적 구현 가능성, 법적 규제 및 리스크를 검토합니다.',
    bm: '단가/마진/유통 구조의 합리성, 매출 발생의 지속성 및 경제적 자생력을 분석합니다.',
    storytelling:
      '문제 정의에서 해결책까지의 인과관계, 사용자 공감을 끌어내는 흐름을 평가합니다.',
    readability:
      '핵심 메시지 강조(3초 룰), 데이터 시각화의 적절성 및 전반적인 가독성을 분석합니다.',
  };
  return map[key] || '';
}
