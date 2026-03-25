'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getSupabase } from '@/lib/supabase/client';
import { ScrollText, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    window.location.href = '/poten-paper';
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-[1156px] mx-auto px-4 sm:px-8 xl:px-[62px] h-14 flex items-center justify-between">
        <Link href="/poten-paper" className="flex items-center gap-2 text-foreground font-bold text-lg">
          <ScrollText className="w-5 h-5" style={{ color: '#0EA5E9' }} />
          포텐페이퍼
        </Link>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-8 bg-muted/30 rounded-lg animate-pulse" />
          ) : user ? (
            <>
              <Link href="/poten-paper/my">
                <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                  <User className="w-4 h-4" />
                  내 사업계획서
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
