'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUserCredits } from '@/hooks/use-user-credits';
import { useActiveSubscription } from '@/hooks/use-subscription';
import { getSupabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Trash2,
  Calendar,
  Loader2,
  Coins,
  Crown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';

const BRAND_COLOR = '#0EA5E9';
const THE_POTENTIAL_URL = 'https://the-potential.co';

type TabKey = 'plans' | 'diagnoses' | 'validations';

interface PlanRow {
  id: string;
  title: string;
  industry: string | null;
  status: string;
  created_at: string;
}
interface DiagnosisRow {
  id: string;
  file_name: string;
  overall_score: number;
  mode: string;
  created_at: string;
}
interface ValidationRow {
  id: string;
  summary: string;
  overall_score: number;
  created_at: string;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

// ── 상태 카드 (구독 / 크레딧 / 베타) ──

function StatusCards({ userId }: { userId: string }) {
  const { data: credits } = useUserCredits(userId);
  const { data: subscription, isLoading: subLoading } = useActiveSubscription(userId);

  const balance = credits?.balance ?? 0;
  const isSub = !!subscription;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: isSub ? `${BRAND_COLOR}15` : '#f3f4f6' }}
          >
            <Crown
              className="w-4 h-4"
              style={{ color: isSub ? BRAND_COLOR : '#9ca3af' }}
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">구독</span>
        </div>
        {subLoading ? (
          <div className="h-6 w-20 bg-muted/30 rounded animate-pulse" />
        ) : isSub ? (
          <>
            <p className="text-lg font-bold text-foreground capitalize">
              {subscription!.plan} 플랜
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(subscription!.expires_at)}까지
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-muted-foreground">미구독</p>
            <a
              href={`${THE_POTENTIAL_URL}/membership`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs mt-1 hover:underline"
              style={{ color: BRAND_COLOR }}
            >
              구독하기 <ExternalLink className="w-3 h-3" />
            </a>
          </>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10">
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">크레딧</span>
        </div>
        <p className="text-lg font-bold text-foreground">
          {balance.toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground ml-1">C</span>
        </p>
        <a
          href={`${THE_POTENTIAL_URL}/mypage`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1 hover:underline"
        >
          더포텐셜에서 적립 <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#8b5cf615' }}
          >
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">베타</span>
        </div>
        <p className="text-lg font-bold text-foreground">무제한 무료</p>
        <p className="text-xs text-muted-foreground mt-1">
          지금은 모든 기능 자유롭게
        </p>
      </div>
    </div>
  );
}

// ── 탭 네비 ──

interface TabDef {
  key: TabKey;
  label: string;
  Icon: typeof FileText;
  count: number;
  color: string;
}

function Tabs({
  active,
  onChange,
  tabs,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
  tabs: TabDef[];
}) {
  return (
    <div className="flex items-center gap-1 mb-5 border-b border-border">
      {tabs.map((t) => {
        const isActive = active === t.key;
        const Icon = t.Icon;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" style={{ color: isActive ? t.color : undefined }} />
            {t.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                isActive ? 'bg-muted text-foreground' : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              {t.count}
            </span>
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: t.color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── 점수 뱃지 (검증·아이디어 공용) ──

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? { bg: 'bg-green-100', text: 'text-green-700' }
      : score >= 60
        ? { bg: 'bg-amber-100', text: 'text-amber-700' }
        : { bg: 'bg-red-100', text: 'text-red-700' };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-semibold ${color.bg} ${color.text}`}>
      {score}점
    </span>
  );
}

// ── 리스트 아이템 (공통 래퍼) ──

interface ItemProps {
  href: string;
  title: string;
  meta: React.ReactNode;
  onDelete: () => void;
  deleting: boolean;
}

function ListItem({ href, title, meta, onDelete, deleting }: ItemProps) {
  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
      <Link href={href} className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{title}</h3>
        <div className="flex items-center gap-3 mt-1 flex-wrap">{meta}</div>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={deleting}
        className="text-muted-foreground hover:text-red-500 shrink-0 ml-2"
      >
        {deleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

// ── Empty state ──

function EmptyState({
  Icon,
  message,
  ctaHref,
  ctaLabel,
  color,
}: {
  Icon: typeof FileText;
  message: string;
  ctaHref: string;
  ctaLabel: string;
  color: string;
}) {
  return (
    <div className="text-center py-20">
      <Icon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
      <p className="text-muted-foreground mb-4">{message}</p>
      <Link href={ctaHref}>
        <Button style={{ backgroundColor: color }} className="text-white">
          {ctaLabel}
        </Button>
      </Link>
    </div>
  );
}

// ── 메인 ──

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<TabKey>('plans');
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisRow[]>([]);
  const [validations, setValidations] = useState<ValidationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login?next=/poten-paper/my');
      return;
    }

    async function fetchAll() {
      const sb = getSupabase();
      const [plansRes, diagRes, valRes] = await Promise.all([
        sb
          .from('business_plans')
          .select('id, title, industry, status, created_at')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        sb
          .from('poten_diagnoses')
          .select('id, file_name, overall_score, mode, created_at')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        (sb as any)
          .from('idea_validations')
          .select('id, summary, overall_score, created_at')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
      ]);

      if (plansRes.data) setPlans(plansRes.data as PlanRow[]);
      if (diagRes.data) setDiagnoses(diagRes.data as DiagnosisRow[]);
      if (valRes.data) setValidations(valRes.data as ValidationRow[]);
      setLoading(false);
    }

    fetchAll();
  }, [user, authLoading, router]);

  const handleDeletePlan = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setDeleting(id);
    const { error } = await getSupabase().from('business_plans').delete().eq('id', id);
    if (!error) setPlans((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  const handleDeleteDiagnosis = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setDeleting(id);
    const { error } = await getSupabase().from('poten_diagnoses').delete().eq('id', id);
    if (!error) setDiagnoses((prev) => prev.filter((d) => d.id !== id));
    setDeleting(null);
  };

  const handleDeleteValidation = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setDeleting(id);
    const { error } = await (getSupabase() as any)
      .from('idea_validations')
      .delete()
      .eq('id', id);
    if (!error) setValidations((prev) => prev.filter((v) => v.id !== id));
    setDeleting(null);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabs: TabDef[] = [
    { key: 'plans', label: '사업계획서', Icon: FileText, count: plans.length, color: BRAND_COLOR },
    { key: 'diagnoses', label: '검증', Icon: ShieldCheck, count: diagnoses.length, color: '#0EA5E9' },
    { key: 'validations', label: '아이디어 검증', Icon: Lightbulb, count: validations.length, color: '#f59e0b' },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">마이페이지</h1>
      </div>

      {user && <StatusCards userId={user.id} />}

      <Tabs active={tab} onChange={setTab} tabs={tabs} />

      {/* 탭별 컨텐츠 */}
      {tab === 'plans' &&
        (plans.length === 0 ? (
          <EmptyState
            Icon={FileText}
            message="아직 작성한 사업계획서가 없습니다."
            ctaHref="/poten-paper/new"
            ctaLabel="첫 사업계획서 만들기"
            color={BRAND_COLOR}
          />
        ) : (
          <div className="space-y-3">
            {plans.map((p) => (
              <ListItem
                key={p.id}
                href={`/poten-paper/${p.id}`}
                title={p.title}
                meta={
                  <>
                    {p.industry && (
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {p.industry}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(p.created_at)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        p.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.status === 'completed' ? '완료' : '생성중'}
                    </span>
                  </>
                }
                onDelete={() => handleDeletePlan(p.id)}
                deleting={deleting === p.id}
              />
            ))}
          </div>
        ))}

      {tab === 'diagnoses' &&
        (diagnoses.length === 0 ? (
          <EmptyState
            Icon={ShieldCheck}
            message="아직 검증한 사업계획서가 없습니다."
            ctaHref="/poten-checker/new"
            ctaLabel="사업계획서 검증하기"
            color="#0EA5E9"
          />
        ) : (
          <div className="space-y-3">
            {diagnoses.map((d) => (
              <ListItem
                key={d.id}
                href={`/poten-checker/result/${d.id}`}
                title={d.file_name}
                meta={
                  <>
                    <ScoreBadge score={d.overall_score} />
                    {d.mode && (
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {d.mode}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(d.created_at)}
                    </span>
                  </>
                }
                onDelete={() => handleDeleteDiagnosis(d.id)}
                deleting={deleting === d.id}
              />
            ))}
          </div>
        ))}

      {tab === 'validations' &&
        (validations.length === 0 ? (
          <EmptyState
            Icon={Lightbulb}
            message="아직 검증한 아이디어가 없습니다."
            ctaHref="/idea-validator/new"
            ctaLabel="아이디어 검증하기"
            color="#f59e0b"
          />
        ) : (
          <div className="space-y-3">
            {validations.map((v) => (
              <ListItem
                key={v.id}
                href={`/idea-validator/${v.id}`}
                title={v.summary || '(요약 없음)'}
                meta={
                  <>
                    <ScoreBadge score={v.overall_score} />
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(v.created_at)}
                    </span>
                  </>
                }
                onDelete={() => handleDeleteValidation(v.id)}
                deleting={deleting === v.id}
              />
            ))}
          </div>
        ))}
    </div>
  );
}
