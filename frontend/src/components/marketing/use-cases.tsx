function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-foreground/8 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
      {children}
    </span>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[92%] self-end rounded-[10px_10px_2px_10px] bg-primary px-3 py-2 text-[12.5px] leading-snug text-primary-foreground">
      {children}
    </div>
  );
}

function BusinessVisual() {
  return (
    <div className="flex min-h-62 flex-col justify-center gap-3 rounded-xl border border-border bg-secondary p-4">
      <div className="flex flex-wrap gap-1.5">
        <Chip>Market research.pdf</Chip>
        <Chip>Competitor pricing.csv</Chip>
        <Chip>Founder notes.md</Chip>
      </div>
      <UserBubble>Draft a one-page business plan from this</UserBubble>
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-faint">
          Business Plan.md
        </div>
        <div className="flex flex-col gap-1 text-[12px] text-foreground">
          <div>1. Problem</div>
          <div>2. Solution</div>
          <div>3. Market</div>
          <div>4. Go-to-market</div>
        </div>
      </div>
    </div>
  );
}

function BuildVisual() {
  return (
    <div className="flex min-h-62 flex-col justify-center gap-3 rounded-xl border border-border bg-secondary p-4">
      <div>
        <Chip>Chicken coop build.md</Chip>
      </div>
      <div className="rounded-lg border border-border bg-card p-3 text-[12.5px] leading-relaxed text-foreground">
        Use{" "}
        <span className="rounded bg-[#fdecea] px-0.5 text-[#9a4b45] line-through">
          2x4 lumber
        </span>{" "}
        <span className="rounded bg-[#e9f7ec] px-0.5 text-[#2e6b3e]">
          pressure-treated 2x4 lumber
        </span>{" "}
        for the frame.
      </div>
      <div className="flex gap-2">
        <div className="flex-1 rounded-md bg-accent-strong py-1.5 text-center text-[11.5px] font-bold text-accent-foreground">
          Accept
        </div>
        <div className="flex-1 rounded-md border border-border py-1.5 text-center text-[11.5px] font-semibold text-muted-foreground">
          Reject
        </div>
      </div>
    </div>
  );
}

function RagVisual() {
  return (
    <div className="flex min-h-62 flex-col justify-center gap-3 rounded-xl border border-border bg-secondary p-4">
      <div className="flex flex-wrap gap-1.5">
        <Chip>Meditations.epub</Chip>
        <Chip>Letters from a Stoic.pdf</Chip>
      </div>
      <UserBubble>What would Marcus Aurelius say about failure?</UserBubble>
      <div className="rounded-lg border border-border bg-card p-3 text-[12.5px] italic leading-relaxed text-foreground">
        &ldquo;You have power over your mind — not outside events.&rdquo;
        <div className="mt-1.5 text-[11px] not-italic font-semibold text-accent-foreground">
          — Meditations, Book 2
        </div>
      </div>
    </div>
  );
}

const useCases = [
  {
    icon: (
      <>
        <rect x="3" y="7.5" width="18" height="12" rx="2" />
        <path d="M8 7.5V6a2 2 0 012-2h4a2 2 0 012 2v1.5" />
        <line x1="3" y1="12.5" x2="21" y2="12.5" />
      </>
    ),
    title: "Business",
    body: "Upload your market research, competitor notes, and financials. Ask Lore to draft the plan — grounded in what you actually gathered.",
    visual: <BusinessVisual />,
  },
  {
    icon: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" />
      </>
    ),
    title: "Help me build something",
    body: "Draft it yourself, then ask Lore to fill gaps or tighten sections. Every suggestion lands as a diff — you accept or reject it, nothing changes silently.",
    visual: <BuildVisual />,
  },
  {
    icon: (
      <>
        <path d="M4 6.5c2-1 5-1 7 0v12c-2-1-5-1-7 0z" />
        <path d="M20 6.5c-2-1-5-1-7 0v12c2-1 5-1 7 0z" />
      </>
    ),
    title: "Grounded research",
    body: "Every response is grounded in what you uploaded — down to the quote and the exact source it came from.",
    visual: <RagVisual />,
  },
];

export function UseCases() {
  return (
    <section className="px-4 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="mb-3 text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[40px]">
          Bring your own&nbsp;
          <span className="relative inline-block isolate">
            <span className="absolute -inset-x-1 bottom-0.5 top-[38%] -z-10 -rotate-1 rounded-[2px_6px_3px_7px] bg-accent-strong/70" />
            use case
          </span>
          .
        </h2>
        <p className="mb-10 max-w-xl text-lg text-muted-foreground sm:mb-12">
          Same notepad, same grounded AI — pick the shape that fits what
          you&apos;re working on.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent text-accent-foreground">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {useCase.icon}
                </svg>
              </div>
              <h4 className="mb-2 text-lg font-bold tracking-tight text-foreground">
                {useCase.title}
              </h4>
              <p className="mb-5 text-[14.5px] leading-[1.65] text-muted-foreground">
                {useCase.body}
              </p>
              <div className="mt-auto">{useCase.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
