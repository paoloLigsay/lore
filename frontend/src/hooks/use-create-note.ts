import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { NoteSummary } from "@/components/lore/note-editor";
import type { LoreSummary } from "@/components/dashboard/lore-card";

function bumpNoteCount(lore: LoreSummary, delta: number): LoreSummary {
  return {
    ...lore,
    _count: { ...lore._count, notes: lore._count.notes + delta },
  };
}

type CreateNoteInput = {
  id: string;
  loreId: string;
  title: string;
  content: string;
};

async function createNote(input: CreateNoteInput): Promise<NoteSummary> {
  const res = await fetch(`/api/lores/${input.loreId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: input.id,
      title: input.title,
      content: input.content,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to create note");
  }

  return res.json();
}

export function useCreateNote(loreId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["lores", loreId, "notes"];

  const mutation = useMutation({
    mutationFn: createNote,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previousNotes = queryClient.getQueryData<NoteSummary[]>(queryKey);
      const previousLore = queryClient.getQueryData<LoreSummary>([
        "lores",
        input.loreId,
      ]);
      const previousLores = queryClient.getQueryData<LoreSummary[]>([
        "lores",
      ]);

      const optimisticNote: NoteSummary = {
        id: input.id,
        loreId: input.loreId,
        title: input.title,
        content: input.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<NoteSummary[]>(queryKey, (old) => [
        ...(old ?? []),
        optimisticNote,
      ]);

      // Keep the lore's note count in sync so the header doesn't show a
      // stale "0 notes" right after creating the first one.
      queryClient.setQueryData<LoreSummary>(
        ["lores", input.loreId],
        (old) => old && bumpNoteCount(old, 1)
      );
      queryClient.setQueryData<LoreSummary[]>(["lores"], (old) =>
        old?.map((lore) =>
          lore.id === input.loreId ? bumpNoteCount(lore, 1) : lore
        )
      );

      return { previousNotes, previousLore, previousLores };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<NoteSummary[]>(queryKey, (old) =>
        old?.map((note) => (note.id === data.id ? data : note))
      );
    },
    onError: (err, input, context) => {
      queryClient.setQueryData(queryKey, context?.previousNotes);
      queryClient.setQueryData(["lores", input.loreId], context?.previousLore);
      queryClient.setQueryData(["lores"], context?.previousLores);
      toast.error(
        err instanceof Error ? err.message : "Couldn't create note."
      );
    },
  });

  function mutate(
    input: { title: string; content: string },
    options?: Parameters<typeof mutation.mutate>[1]
  ) {
    const id = crypto.randomUUID();
    mutation.mutate({ ...input, id, loreId }, options);
    return id;
  }

  return { ...mutation, mutate };
}
