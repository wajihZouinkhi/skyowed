export const metadata = { title: 'About — SkyOwed' };
export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 prose prose-invert">
      <h1>About SkyOwed</h1>
      <p>
        SkyOwed is a tiny tool that tells you, in 30 seconds, whether an airline owes you
        compensation under EU261 or UK261, and generates a ready-to-send claim letter for
        a one-time fee of €6.99. You keep 100% of the compensation — we never take a cut.
      </p>
      <h2>Why we built it</h2>
      <p>
        Most &quot;claim agencies&quot; take 25-50% of your compensation. For a €600 payout, that is
        €150-€300. SkyOwed replaces them with a calculator and a template — the airline
        pays you directly.
      </p>
      <h2>What we are not</h2>
      <ul>
        <li>We are not a law firm and we do not give legal advice.</li>
        <li>We do not contact airlines on your behalf.</li>
        <li>We do not take a success fee.</li>
      </ul>
      <h2>Contact</h2>
      <p>hello@skyowed.app</p>
    </main>
  );
}
