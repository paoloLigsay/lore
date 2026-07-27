"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

import {
  Modal,
  ModalTrigger,
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
import { useCreateLore } from "@/hooks/use-create-lore";

export function AddLoreModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  const mutation = useCreateLore();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Give your lore a name.");
      return;
    }
    setTitleError(null);

    mutation.mutate({
      title: trimmedTitle,
      description: description.trim() || null,
    });

    setOpen(false);
    setTitle("");
    setDescription("");
    setTitleError(null);
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger
        className="flex items-center gap-1.5 rounded-full bg-primary px-4.5 py-2.25 text-sm font-semibold text-primary-foreground hover:opacity-85"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        New Lore
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>New Lore</ModalTitle>
          <ModalDescription>
            A Lore is a private workspace with its own sources and notes.
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="lore-title"
              className="text-sm font-medium text-foreground"
            >
              Title
            </label>
            <Input
              id="lore-title"
              name="title"
              autoFocus
              placeholder="e.g. Product Research"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "lore-title-error" : undefined}
            />
            {titleError && (
              <p id="lore-title-error" className="text-xs text-destructive">
                {titleError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="lore-description"
              className="text-sm font-medium text-foreground"
            >
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="lore-description"
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
            <Button type="submit">Create Lore</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
