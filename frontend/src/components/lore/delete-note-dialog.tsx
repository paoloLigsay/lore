"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useDeleteNote } from "@/hooks/use-delete-note";
import type { NoteSummary } from "./note-editor";

export function DeleteNoteDialog({
  note,
  open,
  onOpenChange,
}: {
  note: NoteSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useDeleteNote();

  function handleConfirm() {
    mutation.mutate(
      { id: note.id, loreId: note.loreId },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Delete note?</ModalTitle>
          <ModalDescription>
            This will permanently delete &quot;{note.title}&quot;, along with
            its chat history and any pending proposals. This action cannot be
            undone.
          </ModalDescription>
        </ModalHeader>

        <ModalFooter>
          <ModalClose
            render={
              <Button type="button" variant="outline">
                Cancel
              </Button>
            }
          />
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
