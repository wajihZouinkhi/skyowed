'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('skyowed-cookies') !== 'accepted') {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem('skyowed-cookies', 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0b0d14]/95 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <p className="text-sm text-white/60">
          We use cookies for authentication and preferences.{' '}
          <Link href="/privacy" className="underline hover:text-white">Privacy policy</Link>
        </p>
        <button onClick={accept} className="shrink-0 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
          Accept
        </button>
      </div>
    </div>
  );
}
