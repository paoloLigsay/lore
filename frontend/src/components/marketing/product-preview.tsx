function TrafficLights() {
  return (
    <div className="flex items-center gap-1.75 border-b border-border px-4 py-3">
      <div className="h-2.75 w-2.75 rounded-full bg-[#ff5f57]" />
      <div className="h-2.75 w-2.75 rounded-full bg-[#febc2e]" />
      <div className="h-2.75 w-2.75 rounded-full bg-[#28c840]" />
      <div className="ml-3 text-[13px] font-medium text-muted-foreground">
        Lore — Atlas of the Old Kingdom
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="border-b border-border bg-secondary px-3.5 py-4.5 md:border-b-0 md:border-r">
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
        Lores
      </div>
      <div className="mb-4.5 flex flex-col gap-0.75">
        <div className="rounded-lg bg-accent px-2.5 py-2 text-[13.5px] font-semibold text-accent-foreground">
          Atlas of the Old Kingdom
        </div>
        <div className="px-2.5 py-2 text-[13.5px] text-muted-foreground">
          Trade Routes &amp; Currency
        </div>
        <div className="px-2.5 py-2 text-[13.5px] text-muted-foreground">
          The Silent Choir
        </div>
      </div>
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
        This Lore
      </div>
      <div className="flex flex-col gap-0.75">
        <div className="flex items-center justify-between px-2.5 py-2 text-[13.5px] text-muted-foreground">
          <span>🔗 Sources</span>
          <span className="text-[11px] text-ink-faint">12</span>
        </div>
        <div className="px-2.5 py-2 text-[13.5px] text-muted-foreground">
          📝 Trade &amp; Currency.md
        </div>
        <div className="px-2.5 py-2 text-[13.5px] text-muted-foreground">
          📝 Founding Myths.md
        </div>
      </div>
    </div>
  );
}

function NoteContent() {
  return (
    <div className="px-7 py-6">
      <div className="mb-1 text-xs text-ink-faint">
        Trade &amp; Currency.md · edited 2m ago
      </div>
      <h3 className="mb-3.5 text-xl font-bold tracking-tight text-foreground">
        Why silver replaced salt
      </h3>
      <p className="text-[14.5px] leading-[1.75] text-foreground">
        For three centuries, salt caravans set the price of everything from
        grain to soldiers&apos; wages.{" "}
        <span className="rounded bg-[#fdecea] px-0.75 py-px text-[#9a4b45] line-through">
          Then the southern mines simply ran dry, and traders switched to
          silver.
        </span>{" "}
        <span className="rounded bg-[#e9f7ec] px-0.75 py-px text-[#2e6b3e]">
          Then the southern mines ran dry in the same decade a silver vein
          was struck in the Ashen Hills — and traders needed a currency that
          didn&apos;t spoil on the caravan.
        </span>{" "}
        Guilds that once measured wealth in bricks of salt began minting
        coin, and the old salt-roads slowly became the kingdom&apos;s first
        postal routes.
      </p>
    </div>
  );
}

function ChatPanel() {
  return (
    <div className="flex flex-col gap-2.5 border-t border-border bg-secondary px-4 py-4.5 md:border-t-0 md:border-l">
      <div className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">
        Chat
      </div>
      <div className="max-w-[90%] self-end rounded-[12px_12px_2px_12px] bg-primary px-3 py-2.25 text-[13px] leading-relaxed text-primary-foreground">
        Make the silver bit explain <em>why</em>, not just that it happened
      </div>
      <div className="max-w-[92%] self-start rounded-[12px_12px_12px_2px] border border-border bg-card px-3 py-2.25 text-[13px] leading-relaxed text-card-foreground">
        Found a source on the Ashen Hills strike. Rewrote the sentence —
        review the change on the left.
      </div>
      <div className="mt-1 flex gap-2">
        <div className="flex-1 rounded-lg bg-accent-strong py-1.75 text-center text-[12.5px] font-bold text-accent-foreground">
          Accept
        </div>
        <div className="flex-1 rounded-lg border border-border py-1.75 text-center text-[12.5px] font-semibold text-muted-foreground">
          Reject
        </div>
      </div>
    </div>
  );
}

export function ProductPreview() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-5xl px-4 pb-16 pt-5 sm:px-8 sm:pb-24"
    >
      <div className="overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_30px_70px_-30px_rgba(0,0,0,0.18)]">
        <TrafficLights />
        <div className="grid grid-cols-1 md:min-h-105 md:grid-cols-[190px_1fr_240px]">
          <Sidebar />
          <NoteContent />
          <ChatPanel />
        </div>
      </div>
    </section>
  );
}
