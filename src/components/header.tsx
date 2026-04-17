'use client';

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
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const BRAND_COLOR = '#0EA5E9';
const POTENLAB_URL = 'https://potenlab.dev';

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

          <a
            href={POTENLAB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Potenlab
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </header>
  );
}
