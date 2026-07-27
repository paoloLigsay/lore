import { useQuery } from "@tanstack/react-query";
import type { LoreSummary } from "@/components/dashboard/lore-card";

async function fetchLores(): Promise<LoreSummary[]> {
  const res = await fetch("/api/lores");
  if (!res.ok) throw new Error("Failed to load lores");
  const data = await res.json();
  return data.lores;
}

export function useLores() {
  return useQuery({
    queryKey: ["lores"],
    queryFn: fetchLores,
  });
}
