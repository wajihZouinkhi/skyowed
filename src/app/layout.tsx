import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkyOwed — Know what your delayed flight owes you',
  description: 'Instant EU261 & UK261 compensation check. Up to €600 / £520 for eligible delays, cancellations and denied boarding.',
  themeColor: '#05060a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
