import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/store';
import NativeBridge from '@/components/NativeBridge';

export const metadata: Metadata = {
  title: 'SkyOwed — Know what your delayed flight owes you',
  description:
    'Instant EU261 & UK261 compensation check. Up to €600 / £520 for eligible delays, cancellations and denied boarding.',
  applicationName: 'SkyOwed',
  appleWebApp: {
    capable: true,
    title: 'SkyOwed',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: 'SkyOwed — EU261/UK261 flight compensation',
    description: 'Check in 30 seconds. Keep 100% of your claim.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkyOwed — EU261/UK261 flight compensation',
    description: 'Check in 30 seconds. Keep 100% of your claim.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#05060a' },
    { media: '(prefers-color-scheme: light)', color: '#f6f7fb' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NativeBridge />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
