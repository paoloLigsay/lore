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
import { useDeleteLore } from "@/hooks/use-delete-lore";
import type { LoreSummary } from "./lore-card";

export function DeleteLoreDialog({
  lore,
  open,
  onOpenChange,
}: {
  lore: LoreSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useDeleteLore();

  function handleConfirm() {
    mutation.mutate(
      { id: lore.id },
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
          <ModalTitle>Delete Lore?</ModalTitle>
          <ModalDescription>
            This will permanently delete "{lore.title}" and all its notes and
            sources. This action cannot be undone.
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
