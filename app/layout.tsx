import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SkyOwed — Keep 100% of your flight compensation',
  description: 'EU261/UK261 eligibility checker + claim letter generator. We take 0%.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
