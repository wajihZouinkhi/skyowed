'use client';
import CheckForm from '@/components/CheckForm';
import ThemeToggle from '@/components/ThemeToggle';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="orb orb-1 float" style={{ width: 420, height: 420, top: -120, right: -80 }} />
      <div className="orb orb-2 float" style={{ width: 360, height: 360, bottom: -100, left: -60, animationDelay: '2s' }} />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">SkyOwed</span>
        </div>
        <div className="hidden gap-8 text-sm md:flex" style={{color: 'var(--fg-muted)'}}>
          <a href="#how" className="hover:opacity-100">How it works</a>
          <a href="#rules" className="hover:opacity-100">Your rights</a>
          <a href="#faq" className="hover:opacity-100">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href="#check" className="chip hover:opacity-80">Check a flight →</a>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-10 text-center md:pt-20">
        <span className="chip mb-6"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> EU261 & UK261 certified logic</span>
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
          Know what your <span className="gradient-text">delayed flight</span> owes you.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl" style={{color: 'var(--fg-muted)'}}>
          In 30 seconds, get an instant eligibility check worth up to <b style={{color: 'var(--fg)'}}>€600</b> or <b style={{color: 'var(--fg)'}}>£520</b>. No lawyers. No 30% cut.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a href="#check" className="btn-primary">Check my flight — free
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#how" className="chip hover:opacity-80">How it works</a>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="chip">✓ No signup</span>
          <span className="chip">✓ Instant result</span>
          <span className="chip">✓ Claim letter included</span>
        </div>
      </section>

      <section id="check" className="relative z-10 mx-auto max-w-3xl px-6 pb-20">
        <CheckForm />
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Three steps. Real money.</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { n: '01', t: 'Enter flight details', d: 'Airports, delay, and reason. Takes 30 seconds.' },
            { n: '02', t: 'Instant eligibility', d: 'We run EU261 & UK261 rules on distance + delay.' },
            { n: '03', t: 'Claim with confidence', d: 'Download a pre-filled letter to send to the airline.' },
          ].map((s) => (
            <div key={s.n} className="glass rounded-2xl p-6">
              <div className="mb-3 text-sm font-bold text-violet-400">{s.n}</div>
              <div className="mb-1 text-lg font-semibold">{s.t}</div>
              <div className="text-sm" style={{color: 'var(--fg-muted)'}}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="rules" className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="glass rounded-3xl p-8 md:p-12">
          <h2 className="mb-2 text-3xl font-bold md:text-4xl">What you could be owed</h2>
          <p className="mb-8" style={{color: 'var(--fg-muted)'}}>Fixed amounts by distance and delay length.</p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { r: '< 1 500 km', eu: '€250', uk: '£220' },
              { r: '1 500 – 3 500 km', eu: '€400', uk: '£350' },
              { r: '> 3 500 km', eu: '€600', uk: '£520' },
            ].map((row) => (
              <div key={row.r} className="rounded-2xl p-5 glass">
                <div className="text-xs uppercase tracking-wider" style={{color: 'var(--fg-muted)'}}>{row.r}</div>
                <div className="mt-2 flex items-baseline gap-3">
                  <div className="text-3xl font-extrabold gradient-text">{row.eu}</div>
                  <div className="text-sm" style={{color: 'var(--fg-muted)'}}>or {row.uk}</div>
                </div>
                <div className="mt-2 text-xs" style={{color: 'var(--fg-muted)'}}>Delay ≥ 3 hours on arrival</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">FAQ</h2>
        <div className="space-y-3">
          {[
            { q: 'Is SkyOwed free?', a: 'Yes. Eligibility check and claim letter are free.' },
            { q: 'Does this replace a lawyer?', a: 'No — but 90% of valid claims succeed with just a polite letter citing the regulation.' },
            { q: 'Which flights are covered?', a: 'Any flight departing the EU/UK, or arriving on an EU/UK carrier.' },
            { q: 'What about weather delays?', a: '“Extraordinary circumstances” disqualify the claim. We ask you about this.' },
          ].map((f) => (
            <details key={f.q} className="glass group rounded-xl p-5 open:ring-1 open:ring-violet-500/30">
              <summary className="cursor-pointer list-none font-medium">
                <span className="mr-2 text-violet-400 group-open:rotate-45 inline-block transition">+</span>{f.q}
              </summary>
              <p className="mt-3 text-sm" style={{color: 'var(--fg-muted)'}}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
