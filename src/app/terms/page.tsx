export const metadata = { title: 'Terms of Use — SkyOwed' };

export default function Terms() {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Terms of Use</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--fg-muted)' }}>Last updated: 2026-04-23</p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed">
        <h2 className="text-xl font-semibold">What SkyOwed is</h2>
        <p>
          SkyOwed provides an automated, non-binding eligibility estimate under
          EU Regulation 261/2004 and the UK equivalent. It is an informational tool.
        </p>

        <h2 className="text-xl font-semibold">Not legal advice</h2>
        <p>
          Results are <strong>not legal advice</strong> and do not create an attorney–client
          relationship. For complex cases, consult a qualified lawyer in your jurisdiction.
        </p>

        <h2 className="text-xl font-semibold">Accuracy</h2>
        <p>
          We apply the published rules faithfully, but airline-specific defences
          (extraordinary circumstances, re-routing offers, etc.) may change your
          actual entitlement. Use the generated claim letter as a starting point.
        </p>

        <h2 className="text-xl font-semibold">Acceptable use</h2>
        <p>
          Do not use SkyOwed to submit false claims, to harass airlines, or in any way
          that violates applicable law.
        </p>

        <h2 className="text-xl font-semibold">Liability</h2>
        <p>
          SkyOwed is provided &quot;as is&quot;, without warranties. To the maximum extent
          permitted by law, we are not liable for indirect or consequential damages.
        </p>

        <h2 className="text-xl font-semibold">Contact</h2>
        <p>Questions: <a href="mailto:hello@skyowed.app" className="underline">hello@skyowed.app</a></p>
      </section>

      <p className="mt-10 text-xs" style={{ color: 'var(--fg-muted)' }}>
        <a href="/" className="underline">← Back to SkyOwed</a>
      </p>
    </main>
  );
}
