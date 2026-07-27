import Link from "next/link";

export function Hero() {
  return (
    <header className="mx-auto w-full max-w-3xl px-4 pb-10 pt-16 text-center sm:px-8">
      <div className="mb-5 inline-block rounded-full bg-accent px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-wide text-accent-foreground">
        AI-native notes
      </div>
      <h1 className="mb-3.5 text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[56px]">
        Notes that know why.
      </h1>
      <p className="mb-2 text-xl font-medium text-muted-foreground">
        Why things are, the way they are.
      </p>
      <p className="mx-auto mb-8 mt-4 max-w-140 text-base leading-relaxed text-muted-foreground">
        Every note starts a Lore — a private space with its own sources and
        an AI that helps you build it. Not a chatbot bolted onto a notepad.
        Notes, grounded.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3.5">
        <Link
          href="/dashboard"
          className="rounded-full bg-primary px-6.5 py-3.25 text-[15px] font-semibold text-primary-foreground hover:opacity-85"
        >
          Try it free
        </Link>
        <a
          href="#how-it-works"
          className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground hover:text-muted-foreground"
        >
          See how it works ↓
        </a>
      </div>
    </header>
  );
}
