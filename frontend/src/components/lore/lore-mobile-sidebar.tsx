"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { LoreSidebar } from "./lore-sidebar";
import type { NoteSummary } from "./note-editor";
import type { SourceSummary } from "@/hooks/use-sources";

export function LoreMobileSidebar({
  currentLoreId,
  notes,
  notesLoading,
  notesError,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  sources,
  sourcesLoading,
  sourcesError,
  uploadingSourceName,
  onUploadSource,
  open,
  onOpenChange,
}: {
  currentLoreId: string;
  notes: NoteSummary[];
  notesLoading: boolean;
  notesError: boolean;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: (title: string, content: string) => void;
  sources: SourceSummary[];
  sourcesLoading: boolean;
  sourcesError: boolean;
  uploadingSourceName: string | null;
  onUploadSource: (file: File) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <DialogPrimitive.Popup className="fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[80vw] flex-col border-r border-border bg-card shadow-[0_0_40px_rgba(0,0,0,0.25)] outline-none transition-transform duration-200 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-bold text-foreground">Lore</span>
            <DialogPrimitive.Close
              aria-label="Close sidebar"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1">
            <LoreSidebar
              currentLoreId={currentLoreId}
              notes={notes}
              notesLoading={notesLoading}
              notesError={notesError}
              selectedNoteId={selectedNoteId}
              onSelectNote={(noteId) => {
                onSelectNote(noteId);
                onOpenChange(false);
              }}
              onCreateNote={(title, content) => {
                onCreateNote(title, content);
                onOpenChange(false);
              }}
              sources={sources}
              sourcesLoading={sourcesLoading}
              sourcesError={sourcesError}
              uploadingSourceName={uploadingSourceName}
              onUploadSource={onUploadSource}
            />
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
