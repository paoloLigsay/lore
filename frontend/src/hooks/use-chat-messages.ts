import { useQuery } from "@tanstack/react-query";

export type ProposalSummary = {
  id: string;
  noteId: string | null;
  // The title to create a new note with — set only when noteId is null
  // (proposing a brand new note rather than editing an existing one).
  noteTitle: string | null;
  agent: "RAG" | "WEB";
  diffBefore: string;
  diffAfter: string;
  explanation: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
};

export type ChatMessageSummary = {
  id: string;
  chatId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  proposal?: ProposalSummary | null;
};

async function fetchChatMessages(chatId: string): Promise<ChatMessageSummary[]> {
  const res = await fetch(`/api/chats/${chatId}/messages`);
  if (!res.ok) throw new Error("Failed to load chat messages");
  const data = await res.json();
  return data.messages;
}

export function useChatMessages(chatId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["chats", chatId, "messages"],
    queryFn: () => fetchChatMessages(chatId as string),
    enabled: chatId !== null && (options?.enabled ?? true),
  });
}
