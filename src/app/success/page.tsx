export const metadata = { title: 'Payment received — SkyOwed' };
export default function SuccessPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-3xl">✓</div>
      <h1 className="mt-6 text-3xl font-bold">Thanks — your letter is on its way</h1>
      <p className="mt-3 text-white/70">Check your email in the next 2 minutes. Reply to this order if it does not arrive: hello@skyowed.app</p>
      <a href="/" className="mt-8 inline-block rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 font-semibold text-white">Check another flight</a>
    </main>
  );
}
