import { useQuery } from "@tanstack/react-query";

export type ChatSummary = {
  id: string;
  loreId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  // Client-only: set on the optimistic entry while a create is in flight,
  // never present on data from the API. Keeps the tab visible but inert —
  // not selectable/deletable — until the server confirms it exists.
  pending?: boolean;
};

async function fetchChats(loreId: string): Promise<ChatSummary[]> {
  const res = await fetch(`/api/lores/${loreId}/chats`);
  if (!res.ok) throw new Error("Failed to load chats");
  const data = await res.json();
  return data.chats;
}

export function useChats(loreId: string) {
  return useQuery({
    queryKey: ["lores", loreId, "chats"],
    queryFn: () => fetchChats(loreId),
  });
}
