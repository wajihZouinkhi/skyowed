'use client';
import { useEffect, useState } from 'react';
import { isNative } from '@/lib/native';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      if (!(await isNative())) {
        const handle = () => setOffline(!navigator.onLine);
        window.addEventListener('online', handle);
        window.addEventListener('offline', handle);
        handle();
        unsub = () => {
          window.removeEventListener('online', handle);
          window.removeEventListener('offline', handle);
        };
        return;
      }

      try {
        const { Network } = await import('@capacitor/network');
        const listener = await Network.addListener('networkStatusChange', (s) => setOffline(!s.connected));
        const status = await Network.getStatus();
        setOffline(!status.connected);
        unsub = () => listener.remove();
      } catch {
        const handle = () => setOffline(!navigator.onLine);
        window.addEventListener('online', handle);
        window.addEventListener('offline', handle);
        handle();
        unsub = () => {
          window.removeEventListener('online', handle);
          window.removeEventListener('offline', handle);
        };
      }
    })();

    return () => { if (unsub) unsub(); };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 px-4 py-2 text-center text-sm font-semibold text-amber-950 backdrop-blur-sm">
      Offline mode — results are saved locally
    </div>
  );
}
