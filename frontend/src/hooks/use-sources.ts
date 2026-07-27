import { useQuery } from "@tanstack/react-query";

export type SourceSummary = {
  id: string;
  loreId: string;
  type: "FILE" | "LINK";
  title: string;
  url: string | null;
  storagePath: string | null;
  fileExt: string | null;
  status: "PROCESSING" | "READY" | "FAILED";
  createdAt: string;
};

async function fetchSources(loreId: string): Promise<SourceSummary[]> {
  const res = await fetch(`/api/lores/${loreId}/sources`);
  if (!res.ok) throw new Error("Failed to load sources");
  const data = await res.json();
  return data.sources;
}

export function useSources(loreId: string) {
  return useQuery({
    queryKey: ["lores", loreId, "sources"],
    queryFn: () => fetchSources(loreId),
  });
}
