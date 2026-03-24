import { ReactNode } from 'react';
import { pretendard } from '@/lib/fonts';
import { Providers } from '@/app/providers';
import '@/app/globals.css';

export const metadata = {
  title: {
    default: '포텐페이퍼 - AI 사업계획서 자동 생성',
    template: '%s | 포텐페이퍼',
  },
  description:
    'AI가 시장 조사부터 사업계획서 작성까지. 정부 지원사업 신청에 맞춘 사업계획서를 자동으로 완성합니다.',
  keywords: [
    '사업계획서',
    'AI',
    '자동생성',
    '정부지원사업',
    '창업',
    '포텐페이퍼',
    '시장조사',
    'business plan',
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://potenpaper.com'
  ),
  openGraph: {
    title: '포텐페이퍼 - AI 사업계획서 자동 생성',
    description:
      'AI가 시장 조사부터 사업계획서 작성까지. 정부 지원사업 신청에 맞춘 사업계획서를 자동으로 완성합니다.',
    siteName: '포텐페이퍼',
    locale: 'ko_KR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col bg-background">
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
