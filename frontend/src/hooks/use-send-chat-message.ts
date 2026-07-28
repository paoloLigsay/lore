import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChatMessageSummary } from "./use-chat-messages";

type SendChatMessageInput = {
  message: string;
  onToken?: (text: string) => void;
  onStatus?: (label: string) => void;
};

async function sendChatMessage(
  chatId: string,
  input: SendChatMessageInput
): Promise<{ message: string }> {
  console.log("[sendChatMessage] Starting message send:", input.message);
  const res = await fetch(`/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input.message }),
  });

  console.log("[sendChatMessage] Response status:", res.status, "ok:", res.ok, "has body:", !!res.body);
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => null);
    console.log("[sendChatMessage] Error response:", data);
    throw new Error(data?.error ?? "Failed to send message");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalMessage: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log("[sendChatMessage] Stream done. Final message:", finalMessage?.substring(0, 50));
      break;
    }
    buffer += decoder.decode(value, { stream: true });

    let separatorIndex;
    while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      const lines = frame.split("\n");
      const eventLine = lines.find((line) => line.startsWith("event: "));
      const dataLine = lines.find((line) => line.startsWith("data: "));
      if (!dataLine) continue;

      const data = JSON.parse(dataLine.slice("data: ".length));
      const event = eventLine?.slice("event: ".length);
      console.log("[sendChatMessage] Stream event:", event);

      if (event === "token") {
        input.onToken?.(data.text);
      } else if (event === "status") {
        input.onStatus?.(data.label);
      } else if (event === "result") {
        finalMessage = data.message;
        console.log("[sendChatMessage] Result received, message length:", finalMessage?.length);
      }
    }
  }

  if (finalMessage === null) {
    console.log("[sendChatMessage] ERROR: Chat stream ended without a response");
    throw new Error("Chat stream ended without a response");
  }

  return { message: finalMessage };
}

export function useSendChatMessage(chatId: string | null, loreId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["chats", chatId, "messages"];

  return useMutation({
    mutationFn: (input: SendChatMessageInput) => {
      if (!chatId) throw new Error("No chat selected");
      return sendChatMessage(chatId, input);
    },
    onSuccess: (data, variables) => {
      const now = new Date().toISOString();
      queryClient.setQueryData<ChatMessageSummary[]>(queryKey, (old) => [
        ...(old ?? []),
        {
          id: crypto.randomUUID(),
          chatId: chatId as string,
          role: "USER",
          content: variables.message,
          createdAt: now,
        },
        {
          id: crypto.randomUUID(),
          chatId: chatId as string,
          role: "ASSISTANT",
          content: data.message,
          createdAt: now,
        },
      ]);
      // The optimistic append above has placeholder ids and no proposal —
      // the real ids (needed for Accept/Reject, which look up a Proposal by
      // its actual database id) and any Proposal only exist once Next.js
      // persists them server-side, after the stream already closed. Refetch
      // to reconcile with the authoritative rows.
      queryClient.invalidateQueries({ queryKey });
      // The first message on a chat sets its title server-side (see
      // /api/chats/[id]/messages) — refetch the tab strip's list so the
      // tab picks up the new title instead of staying "Untitled" until the
      // next unrelated refetch.
      queryClient.invalidateQueries({ queryKey: ["lores", loreId, "chats"] });
    },
    onError: () => {
      toast.error("Couldn't send that message.");
    },
  });
}
