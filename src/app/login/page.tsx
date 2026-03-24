'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ScrollText } from 'lucide-react';

const BRAND_COLOR = '#0EA5E9';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState<'google' | 'kakao' | null>(null);

  const next = searchParams.get('next') ?? '/poten-paper/new';
  const error = searchParams.get('error');

  // Already logged in → redirect
  if (user) {
    router.replace(next);
    return null;
  }

  const handleOAuth = async (provider: 'google' | 'kakao') => {
    setLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ backgroundColor: `${BRAND_COLOR}15` }}
          >
            <ScrollText className="w-8 h-8" style={{ color: BRAND_COLOR }} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">포텐페이퍼</h1>
          <p className="text-sm text-muted mt-2">
            로그인하고 AI 사업계획서를 만들어 보세요
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 text-center">
            로그인에 실패했습니다. 다시 시도해주세요.
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => handleOAuth('google')}
            disabled={!!loading}
            variant="outline"
            className="w-full h-12 text-[15px] font-medium gap-3"
          >
            {loading === 'google' ? (
              <div className="w-5 h-5 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Google로 계속하기
          </Button>

          <Button
            onClick={() => handleOAuth('kakao')}
            disabled={!!loading}
            className="w-full h-12 text-[15px] font-medium gap-3 text-[#191919] hover:opacity-90"
            style={{ backgroundColor: '#FEE500' }}
          >
            {loading === 'kakao' ? (
              <div className="w-5 h-5 border-2 border-[#191919]/30 border-t-[#191919] rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#191919">
                <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.794 5.11 4.504 6.46-.147.538-.946 3.463-.978 3.687 0 0-.02.166.088.23.108.063.235.03.235.03.31-.044 3.588-2.347 4.15-2.746.644.092 1.31.14 1.993.14 5.523 0 10-3.463 10-7.691S17.523 3 12 3" />
              </svg>
            )}
            카카오로 계속하기
          </Button>
        </div>

        {/* Back */}
        <div className="text-center">
          <button
            onClick={() => router.push('/poten-paper')}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
