'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollText } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <ScrollText className="w-12 h-12 text-sky-500" />
          <h1 className="text-2xl font-bold text-foreground">포텐페이퍼</h1>
          <p className="text-sm text-muted">AI 사업계획서 자동 생성 서비스</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 bg-white text-gray-800 border border-border hover:bg-gray-50 font-medium"
          >
            Google로 시작하기
          </Button>
          <Button
            onClick={handleKakaoLogin}
            disabled={loading}
            className="w-full h-12 bg-[#FEE500] text-[#191919] hover:bg-[#FDD835] font-medium"
          >
            카카오로 시작하기
          </Button>
        </div>

        <p className="text-xs text-muted">
          로그인 시 서비스 이용약관에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
