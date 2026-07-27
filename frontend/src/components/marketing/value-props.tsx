const icons = {
  sources: (
    <path d="M9 15l6-6M11 6.5l1-1a3.5 3.5 0 015 5l-1 1M13 17.5l-1 1a3.5 3.5 0 01-5-5l1-1" />
  ),
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  chat: (
    <path d="M4 6.5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H9l-4 3.5V15.5H6a2 2 0 01-2-2z" />
  ),
  toggle: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="4" />
      <circle cx="15" cy="12" r="3" fill="currentColor" stroke="none" />
    </>
  ),
  document: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </>
  ),
  square: <rect x="6" y="6" width="12" height="12" rx="2.5" />,
};

// Border classes are hand-mapped per cell for the responsive 1 / 2 / 3
// column reflow (mobile / sm / lg), so shared dividers land correctly at
// every breakpoint instead of leaving gaps or dangling edges.
const points = [
  {
    icon: icons.sources,
    title: "Sources, not guesses",
    body: "Drop in articles, PDFs, and links. Every answer Lore gives is grounded in what you actually fed it — not a generic guess.",
    border: "border-b sm:border-r",
  },
  {
    icon: icons.shield,
    title: "It won't just agree with you",
    body: "It's not a generic chatbot that tells you what you want to hear. It replies from the files and context you've actually given it — not a canned answer.",
    border: "border-b lg:border-r",
  },
  {
    icon: icons.chat,
    title: "Chat that proposes, not overwrites",
    body: "Ask Lore to tighten, expand, or rewrite a passage. Every suggestion shows up as a before/after — you accept or reject, sentence by sentence.",
    border: "border-b sm:border-r lg:border-r-0",
  },
  {
    icon: icons.toggle,
    title: "Build with AI, or without it",
    body: "It's a notepad first — write freely, nothing forced. Ask for a template or a first draft only when you want a head start.",
    border: "border-b lg:border-b-0 lg:border-r",
  },
  {
    icon: icons.document,
    title: "Familiar, on purpose",
    body: "It looks and feels like the notes app you already use. No new mental model, no onboarding tour — just open it and write.",
    border: "border-b sm:border-b-0 sm:border-r",
  },
  {
    icon: icons.square,
    title: "Simple and focused",
    body: "No workspaces to configure, no databases to design, no integrations to wire up. One notepad, one AI, nothing else to manage.",
    border: "",
  },
];

export function ValueProps() {
  return (
    <section id="features" className="bg-secondary px-4 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="mb-3 text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[40px]">
          Yes, it&apos;s basically a{" "}
          <span className="relative inline-block isolate">
            <span className="absolute -inset-x-1 bottom-0.5 top-[38%] -z-10 -rotate-1 rounded-[2px_6px_3px_7px] bg-accent-strong/70" />
            notepad
          </span>
          .
        </h2>
        <p className="mb-10 max-w-xl text-lg text-muted-foreground sm:mb-12">
          That&apos;s intentional — familiar, on purpose. So what differs?
        </p>

        <div className="grid grid-cols-1 overflow-hidden rounded-[18px] border border-border bg-card sm:grid-cols-2 lg:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.title}
              className={`border-border p-6 sm:p-7 ${point.border}`}
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
                  {point.icon}
                </svg>
              </div>
              <h4 className="mb-2 text-lg font-bold tracking-tight text-foreground">
                {point.title}
              </h4>
              <p className="text-[14.5px] leading-[1.65] text-muted-foreground">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
