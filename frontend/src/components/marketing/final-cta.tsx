import Link from "next/link";

function DecorativeCards() {
  return (
    <div className="relative hidden h-80 w-105 shrink-0 sm:block">
      {/* blank stack peeking out from behind the front card, for depth */}
      <div className="absolute left-8 top-5 h-36 w-80 rotate-2 rounded-2xl bg-card shadow-[0_16px_36px_-18px_rgba(0,0,0,0.18)]" />

      <div className="absolute left-3 top-0 w-80 rotate-[-4deg] rounded-2xl bg-card px-6 py-5.5 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.22)]">
        <div className="mb-2 text-xs text-ink-faint">
          Founding Myths.md
        </div>
        <div className="mb-2.5 text-lg font-bold text-card-foreground">
          The First Winter
        </div>
        <div className="mb-2 h-2.5 w-[90%] rounded bg-border" />
        <div className="h-2.5 w-[70%] rounded bg-border" />
      </div>

      <div className="absolute left-0 top-46 w-44 rotate-[7deg] rounded-xl bg-card px-4 py-3.5 shadow-[0_18px_36px_-18px_rgba(0,0,0,0.2)]">
        <div className="mb-1.5 text-[10px] text-ink-faint">
          Trade &amp; Currency.md
        </div>
        <div className="h-2 w-[85%] rounded bg-border" />
      </div>

      <div className="absolute bottom-0 right-0 w-67.5 rotate-3 rounded-2xl bg-card px-5 py-4.5 shadow-[0_20px_44px_-18px_rgba(0,0,0,0.25)]">
        <div className="text-sm leading-relaxed text-muted-foreground">
          Want me to draft an opening scene from what&apos;s in your sources?
        </div>
        <div className="mt-3 inline-block rounded-full bg-accent-strong px-3.5 py-1.5 text-[13px] font-bold text-accent-foreground">
          Yes, draft it →
        </div>
      </div>
    </div>
  );
}

export function FinalCta() {
  return (
    <section className="bg-accent px-4 py-16 sm:px-8 sm:py-16">
      <div className="mx-auto flex w-full max-w-270 flex-wrap items-center justify-between gap-10 sm:gap-16">
        <div className="min-w-0 flex-1 sm:min-w-75">
          <div className="mb-3.5 text-[13px] font-semibold uppercase tracking-wide text-accent-foreground">
            Ready when you are
          </div>
          <h2 className="mb-3.5 text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[40px]">
            Start your first Lore
          </h2>
          <p className="mb-7.5 max-w-105 text-base leading-relaxed text-muted-foreground">
            Bring a topic and a few sources. Write, or ask Lore to help —
            either way, it starts here.
          </p>
          <Link
            href="/dashboard"
            className="rounded-full bg-primary px-7.5 py-3.5 text-[15.5px] font-semibold text-primary-foreground hover:opacity-85"
          >
            Try it free
          </Link>
        </div>
        <DecorativeCards />
      </div>
    </section>
  );
}
