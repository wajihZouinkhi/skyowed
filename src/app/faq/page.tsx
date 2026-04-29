export const metadata = { title: 'FAQ — SkyOwed' };
const QA: {q:string;a:string}[] = [
  { q: 'How much can I get?', a: 'Up to €600 (EU261) or £520 (UK261) per passenger depending on distance.' },
  { q: 'How far back can I claim?', a: 'Between 1 and 6 years depending on the country of departure. SkyOwed tells you in the result.' },
  { q: 'What if the airline says extraordinary circumstances?', a: 'Weather, strikes, bird strikes, and ATC issues are often disputed. Many airline defences fail in court. Reply and insist; escalate to the national enforcement body if needed.' },
  { q: 'Do you take a cut?', a: 'No. One-time €6.99 for the letter. You keep 100% of the compensation.' },
  { q: 'Which flights are covered?', a: 'Any flight departing from the EU/UK, and flights arriving in the EU/UK operated by an EU/UK airline.' },
];
export default function FAQ() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">FAQ</h1>
      <div className="mt-8 space-y-6">
        {QA.map((x) => (
          <details key={x.q} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <summary className="cursor-pointer font-semibold">{x.q}</summary>
            <p className="mt-2 text-white/70">{x.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
