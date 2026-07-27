import { useQuery } from "@tanstack/react-query";
import type { NoteSummary } from "@/components/lore/note-editor";

async function fetchNotes(loreId: string): Promise<NoteSummary[]> {
  const res = await fetch(`/api/lores/${loreId}/notes`);
  if (!res.ok) throw new Error("Failed to load notes");
  const data = await res.json();
  return data.notes;
}

export function useNotes(loreId: string) {
  return useQuery({
    queryKey: ["lores", loreId, "notes"],
    queryFn: () => fetchNotes(loreId),
  });
}
