import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChatSummary } from "./use-chats";

type CreateChatInput = {
  id: string;
  loreId: string;
};

async function createChat(input: CreateChatInput): Promise<ChatSummary> {
  const res = await fetch(`/api/lores/${input.loreId}/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: input.id }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to create chat");
  }

  return res.json();
}

export function useCreateChat(loreId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["lores", loreId, "chats"];

  const mutation = useMutation({
    mutationFn: createChat,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previousChats = queryClient.getQueryData<ChatSummary[]>(queryKey);

      const now = new Date().toISOString();
      const optimisticChat: ChatSummary = {
        id: input.id,
        loreId: input.loreId,
        title: null,
        createdAt: now,
        updatedAt: now,
        pending: true,
      };
      // New chats appear at the end of the strip, not the start.
      queryClient.setQueryData<ChatSummary[]>(queryKey, (old) => [
        ...(old ?? []),
        optimisticChat,
      ]);

      return { previousChats };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ChatSummary[]>(queryKey, (old) =>
        old?.map((chat) => (chat.id === data.id ? data : chat))
      );
      // A brand new chat has no messages yet — seed the cache directly so
      // the chat panel (which stops treating this chat as "pending" the
      // moment this merge lands) never has to fetch-and-wait to learn what
      // it already knows: there's nothing there.
      queryClient.setQueryData(["chats", data.id, "messages"], []);
    },
    onError: (err, _input, context) => {
      queryClient.setQueryData(queryKey, context?.previousChats);
      toast.error(err instanceof Error ? err.message : "Couldn't create chat.");
    },
  });

  function mutate(options?: Parameters<typeof mutation.mutate>[1]) {
    const id = crypto.randomUUID();
    mutation.mutate({ id, loreId }, options);
    return id;
  }

  return { ...mutation, mutate };
}
