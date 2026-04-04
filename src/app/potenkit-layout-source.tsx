import { ReactNode } from 'react';
import { useRouter } from '../../contexts/RouterContext';
import { Sparkles, Globe } from 'lucide-react';

interface PotenKitLayoutProps {
  children: ReactNode;
  lang?: 'ko' | 'en';
  onLangChange?: (lang: 'ko' | 'en') => void;
  activeNav?: 'it' | 'business';
  hideHeader?: boolean;
}

export function PotenKitLayout({
  children,
  lang = 'ko',
  onLangChange,
  activeNav = 'it',
  hideHeader = false,
}: PotenKitLayoutProps) {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {!hideHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E7E7E7]">
          <div className="max-w-[1156px] mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('potenkit' as any)}
              >
                <div className="w-7 h-7 bg-gradient-to-br from-[#0079FF] to-[#14A697] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-base text-[#222222]">PotenKit</span>
              </div>

              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => navigate('potenkit' as any)}
                  className={`text-sm transition-colors ${
                    activeNav === 'it' ? 'text-[#0079FF] font-semibold' : 'text-[#666666] hover:text-[#0079FF]'
                  }`}
                >
                  {lang === 'ko' ? 'IT 기획' : 'IT Planning'}
                </button>
                <button
                  onClick={() => navigate('potenkit-business' as any)}
                  className={`text-sm transition-colors ${
                    activeNav === 'business' ? 'text-[#0079FF] font-semibold' : 'text-[#666666] hover:text-[#0079FF]'
                  }`}
                >
                  {lang === 'ko' ? '사업 기획' : 'Business'}
                </button>
              </nav>

              <div className="flex items-center gap-3">
                {onLangChange && (
                  <button
                    onClick={() => onLangChange(lang === 'ko' ? 'en' : 'ko')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E7E7E7] hover:border-[#0079FF] rounded-lg transition-all text-xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#666666]" />
                    <span className="font-medium text-[#222222]">{lang === 'ko' ? 'EN' : 'KO'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={!hideHeader ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  );
}
