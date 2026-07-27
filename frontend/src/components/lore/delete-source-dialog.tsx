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
import { useDeleteSource } from "@/hooks/use-delete-source";
import type { SourceSummary } from "@/hooks/use-sources";

export function DeleteSourceDialog({
  source,
  open,
  onOpenChange,
}: {
  source: SourceSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useDeleteSource();

  function handleConfirm() {
    mutation.mutate(
      { id: source.id, loreId: source.loreId },
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
          <ModalTitle>Delete source?</ModalTitle>
          <ModalDescription>
            This will permanently remove &quot;{source.title}&quot; from this
            Lore. Agent answers grounded in it may change. This action cannot
            be undone.
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
