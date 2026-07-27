import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { NoteSummary } from "@/components/lore/note-editor";

type UpdateNoteInput = {
  id: string;
  loreId: string;
  title?: string;
  content?: string;
};

async function updateNote(input: UpdateNoteInput): Promise<NoteSummary> {
  const res = await fetch(`/api/notes/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content }),
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to save note");
  }

  return res.json();
}

export function useUpdateNote(loreId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["lores", loreId, "notes"];

  return useMutation({
    mutationFn: updateNote,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previousNotes = queryClient.getQueryData<NoteSummary[]>(queryKey);

      queryClient.setQueryData<NoteSummary[]>(queryKey, (old) =>
        old?.map((note) =>
          note.id === input.id
            ? {
                ...note,
                ...(input.title !== undefined && { title: input.title }),
                ...(input.content !== undefined && { content: input.content }),
              }
            : note
        )
      );

      return { previousNotes };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<NoteSummary[]>(queryKey, (old) =>
        old?.map((note) => (note.id === data.id ? data : note))
      );
    },
    onError: (err, _input, context) => {
      queryClient.setQueryData(queryKey, context?.previousNotes);
      toast.error(err instanceof Error ? err.message : "Couldn't save note.");
    },
  });
}
