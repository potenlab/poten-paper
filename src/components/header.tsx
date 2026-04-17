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
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const BRAND_COLOR = '#0EA5E9';
const THE_POTENTIAL_URL = 'https://thepotential.kr';

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

function UserMenu({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = (email[0] ?? 'U').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        style={{ backgroundColor: BRAND_COLOR }}
        aria-label="사용자 메뉴"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground">로그인 계정</p>
            <p className="text-sm font-medium text-foreground truncate mt-0.5">{email}</p>
          </div>

          <nav className="py-1">
            <Link
              href="/poten-paper/my"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              마이페이지
            </Link>

            <a
              href={`${THE_POTENTIAL_URL}/profile`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              내 프로필
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
            </a>

            <a
              href={`${THE_POTENTIAL_URL}/mypage`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Coins className="w-4 h-4 text-amber-500" />
              내 크레딧
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
            </a>
          </nav>

          <div className="border-t border-border py-1">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
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
      <div className="max-w-[1156px] mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground font-bold text-lg shrink-0"
        >
          <ScrollText className="w-5 h-5" style={{ color: BRAND_COLOR }} />
          포텐페이퍼
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/pricing">
            <Button variant="ghost" size="sm" className="text-sm">
              가격
            </Button>
          </Link>

          {loading ? (
            <div className="w-20 h-8 bg-muted/30 rounded-lg animate-pulse" />
          ) : user ? (
            <>
              <CreditBadge userId={user.id} />
              <UserMenu email={user.email ?? ''} onLogout={handleLogout} />
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
