import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LoreSummary } from "@/components/dashboard/lore-card";

type DeleteLoreInput = {
  id: string;
};

async function deleteLore(input: DeleteLoreInput): Promise<void> {
  const res = await fetch(`/api/lores/${input.id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to delete lore");
  }
}

export function useDeleteLore() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteLore,
    onSuccess: (_data, input) => {
      queryClient.setQueryData<LoreSummary[]>(["lores"], (old) =>
        old?.filter((lore) => lore.id !== input.id)
      );
      toast.success("Lore deleted");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Couldn't delete lore."
      );
    },
  });

  return mutation;
}
