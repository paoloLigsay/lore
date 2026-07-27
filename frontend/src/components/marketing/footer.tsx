export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-[13px] text-ink-faint sm:flex-row sm:justify-between sm:px-8 sm:text-left">
      <div>© 2026 Lore</div>
      <a
        href="https://paolomartinligsay.netlify.app/"
        className="hover:text-foreground"
      >
        Designed &amp; built by Paolo Ligsay
      </a>
    </footer>
  );
}
