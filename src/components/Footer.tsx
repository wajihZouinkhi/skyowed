export default function Footer() {
  return (
    <footer className="relative z-10 mx-auto max-w-6xl px-6 pb-10 pt-16 text-xs" style={{ color: 'var(--fg-muted)' }}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
        <p>© {new Date().getFullYear()} SkyOwed. Not a law firm. Results are informational.</p>
        <nav className="flex items-center gap-5">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="mailto:hello@skyowed.app" className="hover:underline">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
