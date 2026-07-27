import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { NoteSummary } from "@/components/lore/note-editor";

type DeleteNoteInput = {
  id: string;
  loreId: string;
};

async function deleteNote(input: DeleteNoteInput): Promise<void> {
  const res = await fetch(`/api/notes/${input.id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to delete note");
  }
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: (_data, input) => {
      queryClient.setQueryData<NoteSummary[]>(
        ["lores", input.loreId, "notes"],
        (old) => old?.filter((note) => note.id !== input.id)
      );
      toast.success("Note deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't delete note.");
    },
  });

  return mutation;
}
