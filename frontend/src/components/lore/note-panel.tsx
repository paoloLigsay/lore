"use client";

import { FileText, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteEditor, type NoteSummary } from "./note-editor";
import { NoteProposalReview } from "./note-proposal-review";
import type { ActiveProposal } from "./lore-chat-panel";

function NotePanelSkeleton() {
  return (
    <div className="flex h-full w-full flex-1 flex-col bg-card p-8">
      <Skeleton className="mb-4 h-6 w-1/2" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function NotePanel({
  notes,
  notesLoading,
  notesError,
  selectedNoteId,
  onCreateNote,
  loreId,
  activeProposal,
  onNoteCreated,
}: {
  notes: NoteSummary[];
  notesLoading: boolean;
  notesError: boolean;
  selectedNoteId: string | null;
  onCreateNote: () => void;
  loreId: string;
  activeProposal: ActiveProposal | null;
  onNoteCreated: (noteId: string) => void;
}) {
  if (notesLoading) {
    return <NotePanelSkeleton />;
  }

  if (notesError) {
    return (
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-2 bg-card px-6 text-center">
        <p className="text-[13.5px] font-semibold text-destructive">
          Couldn&apos;t load notes
        </p>
        <p className="max-w-64 text-xs leading-relaxed text-muted-foreground">
          Try refreshing the page.
        </p>
      </div>
    );
  }

  // A proposal for a brand new note has no existing note to attach to, so
  // it can't be shown by matching against selectedNoteId below — show it
  // regardless of what's currently selected, the same way an edit proposal
  // takes over the moment it targets the open note.
  if (activeProposal && activeProposal.proposal.noteId === null) {
    return (
      <NoteProposalReview
        proposal={activeProposal.proposal}
        chatId={activeProposal.chatId}
        loreId={loreId}
        noteTitle={activeProposal.proposal.noteTitle ?? "Untitled"}
        onAccepted={(updatedProposal) => {
          if (updatedProposal.noteId) onNoteCreated(updatedProposal.noteId);
        }}
      />
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-3 bg-card px-6 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-strong/15 text-ink-faint">
          <FileText className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <p className="text-[13.5px] font-semibold text-foreground">
          No notes yet
        </p>
        <p className="max-w-64 text-xs leading-relaxed text-muted-foreground">
          Create your first note to start writing in this Lore.
        </p>
        <button
          type="button"
          onClick={onCreateNote}
          className="mt-1 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-85"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          New note
        </button>
      </div>
    );
  }

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  if (!selectedNote) {
    return (
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-2 bg-card px-6 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-ink-faint">
          <FileText className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <p className="text-[13.5px] font-semibold text-foreground">
          Please select a document
        </p>
        <p className="max-w-64 text-xs leading-relaxed text-muted-foreground">
          Choose a note from the sidebar to start reading or editing.
        </p>
      </div>
    );
  }

  if (activeProposal?.proposal.noteId === selectedNote.id) {
    return (
      <NoteProposalReview
        proposal={activeProposal.proposal}
        chatId={activeProposal.chatId}
        loreId={loreId}
        noteTitle={selectedNote.title}
      />
    );
  }

  return <NoteEditor key={selectedNote.id} note={selectedNote} />;
}
