'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScrollText, ClipboardCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const services = [
  {
    href: '/poten-paper',
    icon: ScrollText,
    name: '포텐페이퍼',
    tagline: 'AI 사업계획서 생성',
    description: '아이디어만 있으면 충분합니다. AI가 시장 조사부터 사업계획서 초안 작성까지 자동으로 완성합니다.',
    color: '#0EA5E9',
    buttonText: '사업계획서 만들기',
  },
  {
    href: '/poten-checker',
    icon: ClipboardCheck,
    name: '포텐체커',
    tagline: 'AI 사업계획서 검증',
    description: '작성된 사업계획서를 6가지 차원으로 분석합니다. 시장성, 차별성, 실현가능성까지 냉정하게 평가합니다.',
    color: '#8B5CF6',
    buttonText: '사업계획서 검증하기',
  },
];

export default function HomePage() {
  return (
    <section className="flex-1 flex items-center justify-center py-20 px-4">
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            아이디어에서 검증까지, <span style={{ color: '#0EA5E9' }}>단 1시간</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            1년 걸릴 일을 1시간으로. 더 많이, 더 빠르게 시도하세요.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
            >
              <Link href={service.href} className="block group">
                <div className="bg-card rounded-2xl border border-border p-8 hover:shadow-xl transition-all hover:border-transparent"
                  style={{ ['--hover-color' as string]: service.color }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${service.color}15` }}
                  >
                    <service.icon className="w-7 h-7" style={{ color: service.color }} />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{service.name}</h2>
                  <p className="text-sm font-medium mb-3" style={{ color: service.color }}>{service.tagline}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                  <Button
                    className="w-full h-12 rounded-xl text-white font-semibold group-hover:shadow-lg transition-all"
                    style={{ backgroundColor: service.color }}
                  >
                    {service.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
