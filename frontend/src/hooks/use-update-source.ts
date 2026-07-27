import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SourceSummary } from "./use-sources";

type UpdateSourceInput = {
  id: string;
  loreId: string;
  title: string;
};

async function updateSource(input: UpdateSourceInput): Promise<SourceSummary> {
  const res = await fetch(`/api/sources/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: input.title }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to rename source");
  }

  return res.json();
}

export function useUpdateSource(loreId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["lores", loreId, "sources"];

  return useMutation({
    mutationFn: updateSource,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previousSources =
        queryClient.getQueryData<SourceSummary[]>(queryKey);

      queryClient.setQueryData<SourceSummary[]>(queryKey, (old) =>
        old?.map((source) =>
          source.id === input.id ? { ...source, title: input.title } : source
        )
      );

      return { previousSources };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<SourceSummary[]>(queryKey, (old) =>
        old?.map((source) => (source.id === data.id ? data : source))
      );
    },
    onError: (err, _input, context) => {
      queryClient.setQueryData(queryKey, context?.previousSources);
      toast.error(
        err instanceof Error ? err.message : "Couldn't rename source."
      );
    },
  });
}
