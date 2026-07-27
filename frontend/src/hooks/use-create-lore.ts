import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LoreSummary } from "@/components/dashboard/lore-card";

type CreateLoreInput = {
  id: string;
  title: string;
  description: string | null;
};

async function createLore(input: CreateLoreInput): Promise<LoreSummary> {
  const res = await fetch("/api/lores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to create lore");
  }

  return res.json();
}

export function useCreateLore() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createLore,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["lores"] });
      const previousLores = queryClient.getQueryData<LoreSummary[]>([
        "lores",
      ]);

      const optimisticLore: LoreSummary = {
        id: input.id,
        title: input.title,
        description: input.description,
        updatedAt: new Date().toISOString(),
        _count: { notes: 0, sources: 0 },
        pending: true,
      };
      queryClient.setQueryData<LoreSummary[]>(["lores"], (old) => [
        optimisticLore,
        ...(old ?? []),
      ]);

      return { previousLores };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<LoreSummary[]>(["lores"], (old) =>
        old?.map((lore) => (lore.id === data.id ? data : lore))
      );
    },
    onError: (err, _input, context) => {
      queryClient.setQueryData(["lores"], context?.previousLores);
      toast.error(
        err instanceof Error ? err.message : "Couldn't create lore."
      );
    },
  });

  function mutate(
    input: { title: string; description: string | null },
    options?: Parameters<typeof mutation.mutate>[1]
  ) {
    mutation.mutate({ ...input, id: crypto.randomUUID() }, options);
  }

  return { ...mutation, mutate };
}
