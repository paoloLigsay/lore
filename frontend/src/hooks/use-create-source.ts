import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SourceSummary } from "@/hooks/use-sources";
import type { LoreSummary } from "@/components/dashboard/lore-card";

function bumpSourceCount(lore: LoreSummary, delta: number): LoreSummary {
  return {
    ...lore,
    _count: { ...lore._count, sources: lore._count.sources + delta },
  };
}

type CreateSourceInput = {
  loreId: string;
  file: File;
};

async function createSource(input: CreateSourceInput): Promise<SourceSummary> {
  const formData = new FormData();
  formData.set("file", input.file);

  const res = await fetch(`/api/lores/${input.loreId}/sources`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to upload source");
  }

  return res.json();
}

// Blocking, not optimistic: a source's status/content aren't known until the
// server has stored and parsed the file, so there's nothing meaningful to
// render before the response lands — see "When to make a mutation
// optimistic" in docs/01-architecture.md.
export function useCreateSource(loreId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["lores", loreId, "sources"];

  return useMutation({
    mutationFn: createSource,
    onSuccess: (data) => {
      queryClient.setQueryData<SourceSummary[]>(queryKey, (old) => [
        ...(old ?? []),
        data,
      ]);
      queryClient.setQueryData<LoreSummary>(
        ["lores", loreId],
        (old) => old && bumpSourceCount(old, 1)
      );
      queryClient.setQueryData<LoreSummary[]>(["lores"], (old) =>
        old?.map((lore) =>
          lore.id === loreId ? bumpSourceCount(lore, 1) : lore
        )
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Couldn't upload source."
      );
    },
  });
}
