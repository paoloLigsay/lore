import { useQuery } from "@tanstack/react-query";
import type { LoreSummary } from "@/components/dashboard/lore-card";

async function fetchLore(id: string): Promise<LoreSummary> {
  const res = await fetch(`/api/lores/${id}`);
  if (!res.ok) throw new Error("Failed to load lore");
  return res.json();
}

export function useLore(id: string) {
  return useQuery({
    queryKey: ["lores", id],
    queryFn: () => fetchLore(id),
  });
}
