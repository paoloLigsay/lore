import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChatMessageSummary, ProposalSummary } from "./use-chat-messages";
import type { NoteSummary } from "@/components/lore/note-editor";

async function acceptProposal(proposalId: string): Promise<ProposalSummary> {
  const res = await fetch(`/api/proposals/${proposalId}/accept`, { method: "POST" });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to accept proposal");
  }
  return res.json();
}

// Accepting rewrites the note's actual content — not cheap to visually
// undo and not something a user should see silently revert, so this is a
// blocking mutation (see "When to make a mutation optimistic" in
// 01-architecture.md), not an optimistic one.
export function useAcceptProposal(chatId: string, loreId: string) {
  const queryClient = useQueryClient();
  const messagesQueryKey = ["chats", chatId, "messages"];

  return useMutation({
    mutationFn: acceptProposal,
    onSuccess: (updatedProposal) => {
      queryClient.setQueryData<ChatMessageSummary[]>(messagesQueryKey, (old) =>
        old?.map((message) =>
          message.proposal?.id === updatedProposal.id
            ? { ...message, proposal: updatedProposal }
            : message
        )
      );
      // diffAfter is the exact content the accept route just persisted —
      // write it straight into the notes cache instead of invalidating, so
      // the document panel has the accepted content the instant it swaps
      // out of review mode (an invalidate's refetch isn't guaranteed to
      // land before that swap happens). The accept route always resolves
      // noteId (linking a freshly created note back onto the proposal), so
      // this is never null here — but a proposal that created a new note
      // won't already have a row in this cache to update, only to insert.
      const noteId = updatedProposal.noteId;
      if (noteId) {
        queryClient.setQueryData<NoteSummary[]>(["lores", loreId, "notes"], (old) => {
          const notes = old ?? [];
          const isExistingNote = notes.some((note) => note.id === noteId);
          if (isExistingNote) {
            return notes.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    content: updatedProposal.diffAfter,
                    updatedAt: new Date().toISOString(),
                  }
                : note
            );
          }
          const now = new Date().toISOString();
          return [
            ...notes,
            {
              id: noteId,
              loreId,
              title: updatedProposal.noteTitle ?? "Untitled",
              content: updatedProposal.diffAfter,
              createdAt: now,
              updatedAt: now,
            },
          ];
        });
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't accept that change.");
    },
  });
}
