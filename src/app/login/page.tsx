'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { IS_MOBILE_BUILD } from '@/lib/isMobileBuild';
import WebOnlyNotice from '@/components/WebOnlyNotice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (IS_MOBILE_BUILD) return <WebOnlyNotice feature="Sign-in" />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-24">
      <h1 className="mb-6 text-3xl font-bold">Sign in to SkyOwed</h1>
      {sent ? (
        <div className="glass rounded-2xl p-6">
          Check your email for the sign-in link.
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <input
            className="field"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-primary w-full" type="submit">
            Send magic link
          </button>
          {err && <p className="text-sm text-red-400">{err}</p>}
        </form>
      )}
    </main>
  );
}
