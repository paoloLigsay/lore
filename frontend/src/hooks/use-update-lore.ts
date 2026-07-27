import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LoreSummary } from "@/components/dashboard/lore-card";

type UpdateLoreInput = {
  id: string;
  title: string;
  description: string | null;
};

async function updateLore(input: UpdateLoreInput): Promise<LoreSummary> {
  const res = await fetch(`/api/lores/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: input.title, description: input.description }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to update lore");
  }

  return res.json();
}

export function useUpdateLore() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateLore,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["lores"] });
      const previousLores = queryClient.getQueryData<LoreSummary[]>([
        "lores",
      ]);

      queryClient.setQueryData<LoreSummary[]>(["lores"], (old) =>
        old?.map((lore) =>
          lore.id === input.id
            ? {
                ...lore,
                title: input.title,
                description: input.description,
              }
            : lore
        )
      );

      return { previousLores };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<LoreSummary[]>(["lores"], (old) =>
        old?.map((lore) => (lore.id === data.id ? data : lore))
      );
      toast.success("Lore updated");
    },
    onError: (err, _input, context) => {
      queryClient.setQueryData(["lores"], context?.previousLores);
      toast.error(
        err instanceof Error ? err.message : "Couldn't update lore."
      );
    },
  });

  return mutation;
}
