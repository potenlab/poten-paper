import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import { Providers } from '@/app/providers';
import { pretendard } from '@/lib/fonts';
import '@/app/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKo = locale === 'ko';

  const title = isKo
    ? '포텐페이퍼 - AI 사업계획서 자동 생성'
    : 'Poten Paper - AI Business Plan Generator';
  const description = isKo
    ? 'AI가 시장 조사부터 사업계획서 작성까지. 정부 지원사업 신청에 맞춘 사업계획서를 자동으로 완성합니다.'
    : 'From market research to business plan writing with AI. Automatically generate business plans tailored for government funding applications.';

  return {
    title: {
      default: title,
      template: '%s | 포텐페이퍼',
    },
    description,
    keywords: ['사업계획서', 'AI', '자동생성', '정부지원사업', '창업', '포텐페이퍼', '시장조사', 'business plan'],
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://potenpaper.com'),
    openGraph: {
      title,
      description,
      siteName: '포텐페이퍼',
      locale: isKo ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={pretendard.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
