'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isNative } from '@/lib/native';

export default function BottomTabs() {
  const [native, setNative] = useState(false);
  const path = usePathname();

  useEffect(() => {
    isNative().then(setNative);
  }, []);

  if (!native) return null;

  const linkClass = (href: string) =>
    `flex flex-col items-center gap-1 text-sm ${path === href ? 'text-white' : 'text-white/60 hover:text-white'}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0b0d14]/90 backdrop-blur-xl px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
      <div className="mx-auto flex max-w-md items-center justify-around">
        <Link href="/" className={linkClass('/')}>
          <span className="text-lg">🏠</span>Home
        </Link>
        <Link href="/history" className={linkClass('/history')}>
          <span className="text-lg">📋</span>History
        </Link>
      </div>
    </nav>
  );
}
