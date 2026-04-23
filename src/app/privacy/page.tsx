export const metadata = { title: 'Privacy Policy — SkyOwed' };

export default function Privacy() {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--fg-muted)' }}>Last updated: 2026-04-23</p>

      <section className="prose prose-invert mt-8 space-y-4 text-sm leading-relaxed" style={{ color: 'var(--fg)' }}>
        <h2 className="text-xl font-semibold">Summary</h2>
        <p>
          SkyOwed is a flight-compensation eligibility checker. We designed it to
          respect your privacy by default. <strong>We do not collect, sell, share, or
          transmit any personal information.</strong> The eligibility check runs entirely
          on your device.
        </p>

        <h2 className="text-xl font-semibold">What we store on your device</h2>
        <ul className="list-disc pl-5">
          <li><code>skyowed.theme</code> — your dark/light preference.</li>
          <li><code>skyowed.prefs</code> — last airports and reason you selected, to speed up your next check.</li>
        </ul>
        <p>
          Both values live in your browser&apos;s or app&apos;s local storage. They never leave your
          device. You can clear them any time by clearing app/site data.
        </p>

        <h2 className="text-xl font-semibold">What we do NOT do</h2>
        <ul className="list-disc pl-5">
          <li>No accounts, logins, or passwords.</li>
          <li>No analytics, tracking pixels, or advertising SDKs.</li>
          <li>No third-party data sharing.</li>
          <li>No access to contacts, camera, microphone, location, or photos.</li>
          <li>No push notifications.</li>
        </ul>

        <h2 className="text-xl font-semibold">Permissions</h2>
        <p>
          The mobile app requests <strong>no runtime permissions</strong>. If a future update
          needs a permission, we will disclose it here and request consent in-app.
        </p>

        <h2 className="text-xl font-semibold">Children</h2>
        <p>SkyOwed is suitable for all audiences and collects no personal data.</p>

        <h2 className="text-xl font-semibold">Contact</h2>
        <p>Questions: <a href="mailto:privacy@skyowed.app" className="underline">privacy@skyowed.app</a></p>
      </section>

      <p className="mt-10 text-xs" style={{ color: 'var(--fg-muted)' }}>
        <a href="/" className="underline">← Back to SkyOwed</a>
      </p>
    </main>
  );
}
