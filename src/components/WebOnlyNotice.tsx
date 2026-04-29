'use client';
export default function WebOnlyNotice({ feature }: { feature: string }) {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">{feature} is available on the web</h1>
      <p className="mt-4 text-white/70">Open skyowed.app in your browser to use this feature.</p>
      <a href="https://skyowed.app" className="btn-primary mt-8 inline-block">Open SkyOwed on the web</a>
    </main>
  );
}
