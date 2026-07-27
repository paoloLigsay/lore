"use client";

import { useState, type FormEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUpdateLore } from "@/hooks/use-update-lore";
import type { LoreSummary } from "./lore-card";

export function EditLoreModal({
  lore,
  open,
  onOpenChange,
}: {
  lore: LoreSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState(lore.title);
  const [description, setDescription] = useState(lore.description || "");
  const [titleError, setTitleError] = useState<string | null>(null);

  const mutation = useUpdateLore();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Give your lore a name.");
      return;
    }
    setTitleError(null);

    mutation.mutate({
      id: lore.id,
      title: trimmedTitle,
      description: description.trim() || null,
    });

    onOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit Lore</ModalTitle>
          <ModalDescription>Update your lore details.</ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-lore-title"
              className="text-sm font-medium text-foreground"
            >
              Title
            </label>
            <Input
              id="edit-lore-title"
              name="title"
              autoFocus
              placeholder="e.g. Product Research"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "edit-lore-title-error" : undefined}
            />
            {titleError && (
              <p id="edit-lore-title-error" className="text-xs text-destructive">
                {titleError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-lore-description"
              className="text-sm font-medium text-foreground"
            >
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="edit-lore-description"
              name="description"
              rows={3}
              placeholder="What's this lore for?"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={cn(
                "flex w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              )}
            />
          </div>

          <ModalFooter>
            <ModalClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button type="submit">Save</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
