'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Send } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabase } from '@/lib/supabase/client';
import type { DiagnosisResult } from '@/lib/poten-checker/types';
import { DiagnosisResultView } from '../../components/diagnosis-result-view';

interface StepResultProps {
  result: DiagnosisResult;
  onReset: () => void;
}

export function StepResult({ result, onReset }: StepResultProps) {
  const [showConsultation, setShowConsultation] = useState(false);
  const [consultLoading, setConsultLoading] = useState(false);
  const [consultForm, setConsultForm] = useState({
    name: '',
    phone: '',
    message: '',
  });

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsultLoading(true);

    try {
      const { error: insertError } = await getSupabase()
        .from('poten_inquiries')
        .insert({
          name: consultForm.name,
          email: '',
          phone: consultForm.phone,
          inquiry_type: 'poten-checker',
          message: `[포텐체커 결과 기반 상담]\n파일: ${result.fileName}\n종합 점수: ${result.overallScore}/10\n\n${consultForm.message}`,
          status: 'new',
        });

      if (insertError) throw insertError;

      toast.success('상담 신청이 접수되었습니다!');
      setShowConsultation(false);
      setConsultForm({ name: '', phone: '', message: '' });
    } catch {
      toast.error('접수 중 오류가 발생했습니다.');
    } finally {
      setConsultLoading(false);
    }
  };

  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <DiagnosisResultView result={result}>
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#8B5CF6]/5 to-[#0079FF]/5 rounded-2xl border border-[#8B5CF6]/20 p-8 mb-6">
          {!showConsultation ? (
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">
                전문가의 심층 컨설팅이 필요하신가요?
              </h3>
              <p className="text-[14px] text-muted mb-5">
                AI 진단 결과를 바탕으로 포텐랩 전문가가 직접 조언해 드립니다.
              </p>
              <Button
                onClick={() => setShowConsultation(true)}
                className="h-12 px-8 rounded-xl bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-semibold"
              >
                상담 신청하기
              </Button>
            </div>
          ) : (
            <form onSubmit={handleConsultSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-foreground mb-1">
                상담 신청
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-semibold">이름 *</label>
                <Input
                  required
                  value={consultForm.name}
                  onChange={(e) =>
                    setConsultForm({ ...consultForm, name: e.target.value })
                  }
                  placeholder="홍길동"
                  className="h-12 rounded-xl border-2 focus:border-[#8B5CF6] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold">연락처 *</label>
                <Input
                  required
                  type="tel"
                  value={consultForm.phone}
                  onChange={(e) =>
                    setConsultForm({ ...consultForm, phone: e.target.value })
                  }
                  placeholder="010-1234-5678"
                  className="h-12 rounded-xl border-2 focus:border-[#8B5CF6] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold">메시지</label>
                <Textarea
                  value={consultForm.message}
                  onChange={(e) =>
                    setConsultForm({ ...consultForm, message: e.target.value })
                  }
                  placeholder="궁금한 점이나 상담받고 싶은 내용을 적어주세요"
                  rows={4}
                  className="rounded-xl border-2 focus:border-[#8B5CF6] transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConsultation(false)}
                  className="h-12 rounded-xl flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={consultLoading}
                  className="h-12 rounded-xl flex-1 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-semibold"
                >
                  {consultLoading ? (
                    '전송 중...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      신청하기
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* New Analysis Button */}
        <div className="text-center">
          <Button
            onClick={onReset}
            variant="outline"
            className="h-12 px-8 rounded-xl gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            새 분석 시작
          </Button>
        </div>
      </DiagnosisResultView>
    </section>
  );
}
