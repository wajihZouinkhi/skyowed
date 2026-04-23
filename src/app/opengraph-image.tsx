import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SkyOwed — EU261/UK261 flight compensation checker';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: 'radial-gradient(60% 60% at 20% 10%, rgba(124,92,255,0.55), transparent 60%), radial-gradient(50% 50% at 90% 90%, rgba(34,211,238,0.45), transparent 60%), #05060a', color: 'white', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, opacity: 0.9 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #7c5cff, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✈</div>
          <div style={{ fontWeight: 700 }}>SkyOwed</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>Know what your<br/><span style={{ background: 'linear-gradient(90deg, #7c5cff, #22d3ee, #f472b6)', backgroundClip: 'text', color: 'transparent' }}>delayed flight</span><br/>owes you.</div>
          <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.7)' }}>Up to €600 · £520 · EU261 + UK261</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: 'rgba(255,255,255,0.55)' }}>
          <div>Instant check · 30 seconds · free</div>
          <div>skyowed.app</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
