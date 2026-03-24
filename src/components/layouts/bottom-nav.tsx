'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollText, Plus, User } from 'lucide-react';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/poten-paper', icon: ScrollText, label: '홈' },
  { href: '/poten-paper/new', icon: Plus, label: '새 계획서' },
  { href: '/mypage', icon: User, label: '내 계획서' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 text-[11px] font-medium py-1.5 px-3',
                isActive ? 'text-sky-500' : 'text-muted'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
