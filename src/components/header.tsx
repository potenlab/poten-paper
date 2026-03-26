'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useUserCredits } from '@/hooks/use-user-credits';
import { getSupabase } from '@/lib/supabase/client';
import { ScrollText, LogIn, LogOut, User, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px] h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-foreground font-bold text-lg">
          <ScrollText className="w-5 h-5" style={{ color: '#0EA5E9' }} />
          포텐페이퍼
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/poten-paper">
            <Button variant="ghost" size="sm" className="text-sm">페이퍼</Button>
          </Link>
          <Link href="/poten-checker">
            <Button variant="ghost" size="sm" className="text-sm">체커</Button>
          </Link>
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
                  마이페이지
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-sm text-muted-foreground">
                <LogOut className="w-4 h-4" />
                로그아웃
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
