import { FileText, Plus, Send } from "lucide-react";

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
    <div className="flex flex-col gap-6 border-b border-border bg-muted/40 px-3.5 py-4.5 md:border-b-0 md:border-r">
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">
            This Lore
          </span>
          <Plus className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
        </div>

        <div className="mb-1.5 px-1 text-[11px] font-semibold text-ink-faint">
          Sources
        </div>
        <div className="mb-4 flex flex-col gap-0.5">
          <div className="flex h-7 items-center gap-2 rounded-lg px-1 text-[13px] text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span className="flex-1 truncate">Trade Ledger 1173</span>
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink-faint">
              pdf
            </span>
          </div>
          <div className="flex h-7 items-center gap-2 rounded-lg px-1 text-[13px] text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span className="flex-1 truncate">Founding Myths</span>
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink-faint">
              txt
            </span>
          </div>
        </div>

        <div className="mb-1.5 px-1 text-[11px] font-semibold text-ink-faint">
          Notes
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex h-7 items-center gap-2 rounded-lg bg-accent px-1 text-[13px] font-medium text-accent-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span className="truncate">Trade &amp; Currency</span>
          </div>
          <div className="flex h-7 items-center gap-2 rounded-lg px-1 text-[13px] font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span className="truncate">Founding Myths</span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
          Lores
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="truncate rounded-lg bg-accent px-1 py-1.5 text-[13px] font-medium text-accent-foreground">
            Atlas of the Old Kingdom
          </div>
          <div className="truncate rounded-lg px-1 py-1.5 text-[13px] font-medium text-muted-foreground">
            Trade Routes &amp; Currency
          </div>
          <div className="truncate rounded-lg px-1 py-1.5 text-[13px] font-medium text-muted-foreground">
            The Silent Choir
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-[13.5px] font-bold text-foreground">
            Trade &amp; Currency
          </h3>
          <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
            Reviewing proposed changes
          </span>
        </div>
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          From your sources
        </span>
      </div>

      <div className="flex-1 px-6 py-5">
        <p className="text-[14px] leading-[1.75] text-foreground">
          For three centuries, salt caravans set the price of everything from
          grain to soldiers&apos; wages.{" "}
          <span className="rounded-[3px] bg-diff-removed-bg px-0.75 py-px text-diff-removed-text line-through">
            Then the southern mines simply ran dry, and traders switched to
            silver.
          </span>{" "}
          <span className="rounded-[3px] bg-diff-added-bg px-0.75 py-px text-diff-added-text">
            Then the southern mines ran dry in the same decade a silver vein
            was struck in the Ashen Hills — and traders needed a currency
            that didn&apos;t spoil on the caravan.
          </span>{" "}
          Guilds that once measured wealth in bricks of salt began minting
          coin, and the old salt-roads slowly became the kingdom&apos;s first
          postal routes.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
        <div className="rounded-lg border border-border px-3.5 py-1.5 text-[12.5px] font-semibold text-muted-foreground">
          Reject
        </div>
        <div className="rounded-lg bg-accent-strong px-3.5 py-1.5 text-[12.5px] font-bold text-accent-foreground">
          Accept
        </div>
      </div>
    </div>
  );
}

function ChatPanel() {
  return (
    <div className="flex flex-col border-t border-border bg-muted/40 md:border-t-0 md:border-l">
      <div className="flex items-center gap-1 border-b border-border px-2 py-2">
        <div className="rounded-md bg-accent-strong px-2.5 py-1 text-[12px] font-medium text-foreground">
          Silver bit
        </div>
        <div className="rounded-md px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
          Founding myths
        </div>
        <Plus className="ml-1 h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3.5">
        <div className="flex justify-end">
          <div className="max-w-[88%] rounded-lg bg-primary px-3 py-2 text-[12.5px] leading-relaxed text-primary-foreground">
            Make the silver bit explain <em>why</em>, not just that it
            happened
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[90%] rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] leading-relaxed text-card-foreground">
            Found a source on the Ashen Hills strike. Rewrote the sentence —
            review the change in the document panel.
          </div>
        </div>
        <p className="text-[11.5px] italic text-ink-faint">
          Proposed changes to &ldquo;Trade &amp; Currency&rdquo; — review it
          in the document panel.
        </p>
      </div>

      <div className="flex items-end gap-2 border-t border-border p-3">
        <div className="flex-1 rounded-2xl border border-border bg-background px-3.5 py-2 text-[12.5px] text-muted-foreground">
          Ask about this Lore…
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Send className="h-3.5 w-3.5" strokeWidth={2} />
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
        <div className="grid grid-cols-1 md:min-h-105 md:grid-cols-[200px_1fr_260px]">
          <Sidebar />
          <NoteContent />
          <ChatPanel />
        </div>
      </div>
    </section>
  );
}
