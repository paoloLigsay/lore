import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChatMessageSummary, ProposalSummary } from "./use-chat-messages";

async function rejectProposal(proposalId: string): Promise<ProposalSummary> {
  const res = await fetch(`/api/proposals/${proposalId}/reject`, { method: "POST" });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to reject proposal");
  }
  return res.json();
}

export function useRejectProposal(chatId: string) {
  const queryClient = useQueryClient();
  const messagesQueryKey = ["chats", chatId, "messages"];

  return useMutation({
    mutationFn: rejectProposal,
    onSuccess: (updatedProposal) => {
      queryClient.setQueryData<ChatMessageSummary[]>(messagesQueryKey, (old) =>
        old?.map((message) =>
          message.proposal?.id === updatedProposal.id
            ? { ...message, proposal: updatedProposal }
            : message
        )
      );
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't reject that change.");
    },
  });
}
