'use client';

import Link from 'next/link';
import { ScrollText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-border bg-card py-8">
      <div className="max-w-[1156px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between">
          <Link href="/poten-paper" className="flex items-center gap-2 font-bold text-foreground">
            <ScrollText className="w-5 h-5 text-sky-500" />
            포텐페이퍼
          </Link>
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} PotenLab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
