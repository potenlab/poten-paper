import { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layouts/header';
import { BottomNav } from '@/components/layouts/bottom-nav';
import { Footer } from '@/components/layouts/footer';

interface PotenPaperLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PotenPaperLayout({
  children,
  params,
}: PotenPaperLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col pt-16 pb-24 md:pb-8">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
