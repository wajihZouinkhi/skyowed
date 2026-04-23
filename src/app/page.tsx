import CheckForm from "@/components/CheckForm";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="px-5 py-4 sm:px-8 flex items-center justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✈️</span>
          <span className="font-bold text-lg text-brand">SkyOwed</span>
        </div>
        <a href="#check" className="text-sm font-medium text-brand hover:text-brand-dark">Check my flight</a>
      </header>
      <section className="px-5 sm:px-8 pt-10 pb-8 sm:pt-16 sm:pb-12 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">Your flight was delayed. <br className="hidden sm:block" />The airline may owe you <span className="text-accent">up to €600</span>.</h1>
        <p className="mt-5 text-base sm:text-lg text-slate-600">AirHelp keeps 35%. We keep <b>0%</b>. SkyOwed is a tool — we tell you what you're owed and generate the claim letter. You send it. You keep <b>100%</b>.</p>
      </section>
      <section id="check" className="px-5 sm:px-8 pb-24 max-w-3xl mx-auto"><CheckForm /></section>
      <footer className="border-t border-slate-200 bg-white px-5 sm:px-8 py-6 text-xs text-slate-500 text-center">SkyOwed is not a law firm. This tool provides information only, not legal advice. Regulation (EC) 261/2004 and the UK Air Passenger Rights Regulation are the authoritative sources.</footer>
    </main>
  );
}
