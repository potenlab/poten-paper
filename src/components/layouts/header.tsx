'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScrollText, LogOut, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export function Header() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/poten-paper');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-[1156px] mx-auto h-full flex items-center justify-between px-4 sm:px-8">
        <Link href="/poten-paper" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <ScrollText className="w-6 h-6 text-sky-500" />
          포텐페이퍼
        </Link>

        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/poten-paper/new')}
                    className="text-sm"
                  >
                    새 사업계획서
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleLogin}>
                  <LogIn className="w-4 h-4 mr-1" />
                  로그인
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
