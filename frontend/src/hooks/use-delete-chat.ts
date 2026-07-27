import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChatSummary } from "./use-chats";

type DeleteChatInput = {
  id: string;
  loreId: string;
};

async function deleteChat(input: DeleteChatInput): Promise<void> {
  const res = await fetch(`/api/chats/${input.id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to delete chat");
  }
}

export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChat,
    onMutate: async (input) => {
      const queryKey = ["lores", input.loreId, "chats"];
      await queryClient.cancelQueries({ queryKey });
      const previousChats = queryClient.getQueryData<ChatSummary[]>(queryKey);
      queryClient.setQueryData<ChatSummary[]>(queryKey, (old) =>
        old?.filter((chat) => chat.id !== input.id)
      );
      return { previousChats };
    },
    onError: (err, input, context) => {
      queryClient.setQueryData(["lores", input.loreId, "chats"], context?.previousChats);
      toast.error(err instanceof Error ? err.message : "Couldn't delete chat.");
    },
  });
}
