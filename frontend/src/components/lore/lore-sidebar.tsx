"use client";

import { useState } from "react";
import Link from "next/link";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { FileText, Loader2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLores } from "@/hooks/use-lores";
import { useUpdateNote } from "@/hooks/use-update-note";
import { useUpdateSource } from "@/hooks/use-update-source";
import { Skeleton } from "@/components/ui/skeleton";
import { AddContentMenu } from "./add-content-menu";
import { InlineRenameInput } from "./inline-rename-input";
import { DeleteSourceDialog } from "./delete-source-dialog";
import { DeleteNoteDialog } from "./delete-note-dialog";
import type { NoteSummary } from "./note-editor";
import type { SourceSummary } from "@/hooks/use-sources";

const MENU_ITEM_CLASS =
  "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-foreground outline-none data-[highlighted]:bg-muted";

export function LoreSidebar({
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
}) {
  const { data: lores, isLoading } = useLores();
  const updateNoteMutation = useUpdateNote(currentLoreId);
  const updateSourceMutation = useUpdateSource(currentLoreId);
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renamingSourceId, setRenamingSourceId] = useState<string | null>(
    null
  );
  const [deletingSource, setDeletingSource] = useState<SourceSummary | null>(
    null
  );
  const [deletingNote, setDeletingNote] = useState<NoteSummary | null>(null);

  return (
    <aside className="scrollbar-minimal flex h-full flex-col gap-6 overflow-y-auto bg-muted/40 p-4">
      <div>
        <div className="mb-2 flex items-center justify-between px-2.5">
          <span className="text-[11px] font-bold tracking-wide text-ink-faint uppercase">
            This Lore
          </span>
          <AddContentMenu
            onCreateNote={onCreateNote}
            onUploadSource={onUploadSource}
          />
        </div>

        <div className="mb-1.5 px-2.5 text-[11px] font-semibold text-ink-faint">
          Sources
        </div>
        <div className="flex flex-col gap-0.5">
          {sourcesLoading ? (
            <Skeleton className="h-8 w-full rounded-lg" />
          ) : sourcesError ? (
            <p className="px-2.5 py-1.5 text-[13px] text-destructive">
              Couldn&apos;t load sources
            </p>
          ) : sources.length === 0 && !uploadingSourceName ? (
            <p className="px-2.5 py-1.5 text-[13px] text-ink-faint">
              No sources yet
            </p>
          ) : (
            <>
              {sources.map((source) => (
                <ContextMenuPrimitive.Root key={source.id}>
                  <ContextMenuPrimitive.Trigger className="contents">
                    {/* Fixed height on both states so swapping the row's
                        content for the rename input doesn't shift the list
                        below it — see InlineRenameInput's own note on why
                        an <input>'s box metrics differ from plain text. */}
                    {renamingSourceId === source.id ? (
                      <div className="flex h-8 items-center px-2.5">
                        <InlineRenameInput
                          initialValue={source.title}
                          onCommit={(title) => {
                            updateSourceMutation.mutate({
                              id: source.id,
                              loreId: currentLoreId,
                              title,
                            });
                            setRenamingSourceId(null);
                          }}
                          onCancel={() => setRenamingSourceId(null)}
                          className="text-[13.5px]"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "flex h-8 items-center gap-2 rounded-lg px-2.5 text-[13.5px] text-muted-foreground transition-colors",
                          "hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <FileText
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={2}
                        />
                        <span className="flex-1 truncate">
                          {source.title}
                        </span>
                        {source.status === "FAILED" ? (
                          <span className="shrink-0 text-[10px] font-semibold text-destructive">
                            Failed
                          </span>
                        ) : source.fileExt ? (
                          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-ink-faint uppercase">
                            {source.fileExt}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </ContextMenuPrimitive.Trigger>
                  <ContextMenuPrimitive.Portal>
                    <ContextMenuPrimitive.Positioner>
                      <ContextMenuPrimitive.Popup className="z-50 min-w-40 rounded-lg border border-border bg-card p-1 text-card-foreground shadow-[0_16px_34px_-18px_rgba(0,0,0,0.25)] outline-none transition-all duration-100 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                        <ContextMenuPrimitive.Item
                          onClick={() => setRenamingSourceId(source.id)}
                          className={MENU_ITEM_CLASS}
                        >
                          <Pencil
                            className="h-3.5 w-3.5 text-ink-faint"
                            strokeWidth={2}
                          />
                          Rename
                        </ContextMenuPrimitive.Item>
                        <ContextMenuPrimitive.Item
                          onClick={() => setDeletingSource(source)}
                          className={cn(
                            MENU_ITEM_CLASS,
                            "text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
                          )}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          Delete
                        </ContextMenuPrimitive.Item>
                      </ContextMenuPrimitive.Popup>
                    </ContextMenuPrimitive.Positioner>
                  </ContextMenuPrimitive.Portal>
                </ContextMenuPrimitive.Root>
              ))}
              {uploadingSourceName && (
                <div
                  aria-busy
                  className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-[13.5px] text-ink-faint"
                >
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                  <span className="flex-1 truncate italic">
                    {uploadingSourceName}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-3 mb-1.5 px-2.5 text-[11px] font-semibold text-ink-faint">
          Notes
        </div>
        <div className="flex flex-col gap-0.5">
          {notesLoading ? (
            [0, 1].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))
          ) : notesError ? (
            <p className="px-2.5 py-1.5 text-[13px] text-destructive">
              Couldn&apos;t load notes
            </p>
          ) : notes.length === 0 ? (
            <p className="px-2.5 py-1.5 text-[13px] text-ink-faint">
              No notes yet
            </p>
          ) : (
            notes.map((note) => (
              <ContextMenuPrimitive.Root key={note.id}>
                <ContextMenuPrimitive.Trigger className="contents">
                  {/* Fixed height on both states so swapping the row's
                      content for the rename input doesn't shift the list
                      below it — see InlineRenameInput's own note on why
                      an <input>'s box metrics differ from plain text. */}
                  {renamingNoteId === note.id ? (
                    <div className="flex h-8 items-center px-2.5">
                      <InlineRenameInput
                        initialValue={note.title}
                        onCommit={(title) => {
                          updateNoteMutation.mutate({
                            id: note.id,
                            loreId: currentLoreId,
                            title,
                          });
                          setRenamingNoteId(null);
                        }}
                        onCancel={() => setRenamingNoteId(null)}
                        className="text-[13.5px] font-medium"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectNote(note.id)}
                      className={cn(
                        "flex h-8 items-center gap-2 truncate rounded-lg px-2.5 text-left text-[13.5px] font-medium transition-colors",
                        note.id === selectedNoteId
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <FileText
                        className="h-3.5 w-3.5 shrink-0"
                        strokeWidth={2}
                      />
                      <span className="truncate">{note.title}</span>
                    </button>
                  )}
                </ContextMenuPrimitive.Trigger>
                <ContextMenuPrimitive.Portal>
                  <ContextMenuPrimitive.Positioner>
                    <ContextMenuPrimitive.Popup className="z-50 min-w-40 rounded-lg border border-border bg-card p-1 text-card-foreground shadow-[0_16px_34px_-18px_rgba(0,0,0,0.25)] outline-none transition-all duration-100 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                      <ContextMenuPrimitive.Item
                        onClick={() => setRenamingNoteId(note.id)}
                        className={MENU_ITEM_CLASS}
                      >
                        <Pencil
                          className="h-3.5 w-3.5 text-ink-faint"
                          strokeWidth={2}
                        />
                        Rename
                      </ContextMenuPrimitive.Item>
                      <ContextMenuPrimitive.Item
                        onClick={() => setDeletingNote(note)}
                        className={cn(
                          MENU_ITEM_CLASS,
                          "text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        Delete
                      </ContextMenuPrimitive.Item>
                    </ContextMenuPrimitive.Popup>
                  </ContextMenuPrimitive.Positioner>
                </ContextMenuPrimitive.Portal>
              </ContextMenuPrimitive.Root>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 px-2.5 text-[11px] font-bold tracking-wide text-ink-faint uppercase">
          Lores
        </div>
        <div className="flex flex-col gap-0.5">
          {isLoading
            ? [0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))
            : lores?.map((lore) => (
                <Link
                  key={lore.id}
                  href={`/lore/${lore.id}`}
                  className={cn(
                    "truncate rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                    lore.id === currentLoreId
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {lore.title}
                </Link>
              ))}
        </div>
      </div>

      {deletingSource && (
        <DeleteSourceDialog
          source={deletingSource}
          open={Boolean(deletingSource)}
          onOpenChange={(open) => {
            if (!open) setDeletingSource(null);
          }}
        />
      )}

      {deletingNote && (
        <DeleteNoteDialog
          note={deletingNote}
          open={Boolean(deletingNote)}
          onOpenChange={(open) => {
            if (!open) setDeletingNote(null);
          }}
        />
      )}
    </aside>
  );
}
