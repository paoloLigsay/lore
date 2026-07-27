import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SourceSummary } from "./use-sources";

type DeleteSourceInput = {
  id: string;
  loreId: string;
};

async function deleteSource(input: DeleteSourceInput): Promise<void> {
  const res = await fetch(`/api/sources/${input.id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to delete source");
  }
}

export function useDeleteSource() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteSource,
    onSuccess: (_data, input) => {
      queryClient.setQueryData<SourceSummary[]>(
        ["lores", input.loreId, "sources"],
        (old) => old?.filter((source) => source.id !== input.id)
      );
      toast.success("Source deleted");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Couldn't delete source."
      );
    },
  });

  return mutation;
}
