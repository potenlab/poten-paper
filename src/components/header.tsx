'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useUserCredits } from '@/hooks/use-user-credits';
import { getSupabase } from '@/lib/supabase/client';
import {
  ScrollText,
  LogIn,
  LogOut,
  User,
  Coins,
  ChevronDown,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const BRAND_COLOR = '#0EA5E9';

function CreditBadge({ userId }: { userId: string }) {
  const { data } = useUserCredits(userId);
  const balance = data?.balance ?? 0;

  return (
    <Link href="/poten-paper/my">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 transition-colors text-sm">
        <Coins className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          {balance.toLocaleString()}
        </span>
      </span>
    </Link>
  );
}

function ServicesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
      >
        기타 서비스
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-60 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <Link
            href="/poten-checker/new"
            onClick={() => setOpen(false)}
            className="flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors"
          >
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-sky-500" />
            <div>
              <div className="text-sm font-medium">사업계획서 검증</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                작성한 계획서 점검
              </div>
            </div>
          </Link>
          <Link
            href="/idea-validator/new"
            onClick={() => setOpen(false)}
            className="flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors border-t border-border"
          >
            <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
            <div>
              <div className="text-sm font-medium">아이디어 검증</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                러프 아이디어 빠른 스크리닝
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    window.location.href = '/poten-paper';
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px] h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground font-bold text-lg shrink-0"
        >
          <ScrollText className="w-5 h-5" style={{ color: BRAND_COLOR }} />
          포텐페이퍼
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/poten-paper/new">
            <Button
              size="sm"
              className="text-sm text-white hover:opacity-90"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              사업계획서 생성
            </Button>
          </Link>
          <ServicesDropdown />
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-8 bg-muted/30 rounded-lg animate-pulse" />
          ) : user ? (
            <>
              <CreditBadge userId={user.id} />
              <Link href="/poten-paper/my">
                <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">마이페이지</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-sm text-muted-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </Button>
            </>
          ) : (
            <Link href="/login?next=/poten-paper">
              <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                <LogIn className="w-4 h-4" />
                로그인
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
