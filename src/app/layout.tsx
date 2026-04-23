import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkyOwed — Flight delay compensation. Keep 100%.",
  description:
    "Check if your delayed, cancelled, or overbooked flight is owed EU261 / UK261 compensation. Generate the claim letter. Keep every cent.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B5FFF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
