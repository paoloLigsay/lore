"use client";

import { diffWords } from "diff";
import type { ProposalSummary } from "@/hooks/use-chat-messages";
import { useAcceptProposal } from "@/hooks/use-accept-proposal";
import { useRejectProposal } from "@/hooks/use-reject-proposal";

const AGENT_LABEL: Record<ProposalSummary["agent"], string> = {
  RAG: "From your sources",
  WEB: "From a web search",
};

function DiffPreview({ before, after }: { before: string; after: string }) {
  const parts = diffWords(before, after);
  return (
    <p className="whitespace-pre-wrap text-[14.5px] leading-[1.75] text-foreground">
      {parts.map((part, index) => {
        if (part.added) {
          return (
            <span
              key={index}
              className="rounded-[3px] bg-diff-added-bg px-[3px] py-px text-diff-added-text"
            >
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span
              key={index}
              className="rounded-[3px] bg-diff-removed-bg px-[3px] py-px text-diff-removed-text line-through"
            >
              {part.value}
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </p>
  );
}

// Note content only ever changes through this accept step (see the
// diff-review invariant in CLAUDE.md) — the panel therefore replaces the
// editor entirely while a proposal is pending, rather than showing the diff
// alongside an editable note.
export function NoteProposalReview({
  proposal,
  chatId,
  loreId,
  noteTitle,
  onAccepted,
}: {
  proposal: ProposalSummary;
  chatId: string;
  loreId: string;
  noteTitle: string;
  // Fires with the accepted proposal (now carrying a real noteId) once the
  // mutation resolves — used to auto-select a note that didn't exist until
  // this acceptance created it; irrelevant, and safe to omit, when
  // reviewing a change to a note that already existed.
  onAccepted?: (updatedProposal: ProposalSummary) => void;
}) {
  const acceptProposal = useAcceptProposal(chatId, loreId);
  const rejectProposal = useRejectProposal(chatId);
  const isPending = acceptProposal.isPending || rejectProposal.isPending;

  return (
    <section className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-[13.5px] font-bold text-foreground">
            {noteTitle}
          </h2>
          <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
            Reviewing proposed changes
          </span>
        </div>
        <span className="shrink-0 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          {AGENT_LABEL[proposal.agent]}
        </span>
      </div>

      <div className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <DiffPreview before={proposal.diffBefore} after={proposal.diffAfter} />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => rejectProposal.mutate(proposal.id)}
          className="rounded-lg border border-border px-4 py-1.5 text-center text-[12.5px] font-semibold text-muted-foreground transition-opacity disabled:opacity-50"
        >
          {rejectProposal.isPending ? "Rejecting…" : "Reject"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => acceptProposal.mutate(proposal.id, { onSuccess: onAccepted })}
          className="rounded-lg bg-accent px-4 py-1.5 text-center text-[12.5px] font-bold text-accent-foreground transition-opacity disabled:opacity-50"
        >
          {acceptProposal.isPending ? "Accepting…" : "Accept"}
        </button>
      </div>
    </section>
  );
}
