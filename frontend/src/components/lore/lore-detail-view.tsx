"use client";

import { useEffect, useRef, useState } from "react";
import { Group, Panel } from "react-resizable-panels";
import { useLore } from "@/hooks/use-lore";
import { useNotes } from "@/hooks/use-notes";
import { useCreateNote } from "@/hooks/use-create-note";
import { useSources } from "@/hooks/use-sources";
import { useCreateSource } from "@/hooks/use-create-source";
import { Skeleton } from "@/components/ui/skeleton";
import { LorePageHeader } from "./lore-page-header";
import { LoreSidebar } from "./lore-sidebar";
import { NotePanel } from "./note-panel";
import { LoreChatPanel, type ActiveProposal } from "./lore-chat-panel";
import { LoreMobileSidebar } from "./lore-mobile-sidebar";
import { ResizeHandle } from "./resize-handle";

function PanelsSkeleton() {
  return (
    <div className="flex min-h-0 flex-1">
      <div className="hidden w-68 shrink-0 flex-col gap-2 border-r border-border bg-muted/40 p-4 lg:flex">
        <Skeleton className="mb-1 h-3 w-14" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      <div className="flex-1 bg-card p-8">
        <Skeleton className="mb-4 h-6 w-1/2" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="hidden w-80 shrink-0 border-l border-border bg-muted/40 p-4 lg:block">
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

export function LoreDetailView({
  loreId,
  email,
}: {
  loreId: string;
  email: string;
}) {
  const { data: lore, isLoading, isError } = useLore(loreId);
  const {
    data: notesData,
    isLoading: notesLoading,
    isError: notesError,
  } = useNotes(loreId);
  const notes = notesData ?? [];
  const createNoteMutation = useCreateNote(loreId);
  const {
    data: sourcesData,
    isLoading: sourcesLoading,
    isError: sourcesError,
  } = useSources(loreId);
  const sources = sourcesData ?? [];
  const createSourceMutation = useCreateSource(loreId);
  const uploadingSourceName = createSourceMutation.isPending
    ? createSourceMutation.variables.file.name
    : null;

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeProposal, setActiveProposal] = useState<ActiveProposal | null>(
    null
  );
  // Tracks which proposal id we've already auto-navigated for, so a newly
  // arrived proposal jumps the document panel to its note exactly once —
  // manually switching away afterward (while it's still pending) isn't
  // overridden on the next render.
  const navigatedProposalIdRef = useRef<string | null>(null);

  // Give the first note importance by default — land the user somewhere
  // useful instead of an empty "select a document" prompt whenever one
  // already exists. Falls back to the first note both when nothing has
  // been explicitly selected yet, and if a previously-selected id no
  // longer matches any note (e.g. deleted elsewhere).
  const effectiveSelectedNoteId =
    notes.find((note) => note.id === selectedNoteId)?.id ??
    notes[0]?.id ??
    null;

  useEffect(() => {
    if (!activeProposal) return;
    if (navigatedProposalIdRef.current === activeProposal.proposal.id) return;
    navigatedProposalIdRef.current = activeProposal.proposal.id;
    // A proposal for a brand new note has no existing note to navigate to —
    // NotePanel shows it as an overlay instead, regardless of selection.
    if (!activeProposal.proposal.noteId) return;
    // Ref-guarded reaction to an external event (a proposal arriving), not
    // state derived from a prop — the recommended escape hatch per
    // https://react.dev/learn/you-might-not-need-an-effect. The lint rule's
    // heuristic flags this only because setSelectedNoteId is also called
    // from a plain event handler elsewhere in this component (confirmed by
    // isolating this exact effect body, which lints clean on its own).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedNoteId(activeProposal.proposal.noteId);
  }, [activeProposal]);

  function handleCreateNote(title: string, content: string) {
    const id = createNoteMutation.mutate({ title, content });
    setSelectedNoteId(id);
  }

  function handleUploadSource(file: File) {
    createSourceMutation.mutate({ loreId, file });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <LorePageHeader
        email={email}
        lore={lore}
        isLoading={isLoading}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
      />

      {isLoading ? (
        <PanelsSkeleton />
      ) : isError || !lore ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-destructive">
            Couldn&apos;t load this lore.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: resizable 3-panel layout */}
          <div className="hidden min-h-0 flex-1 lg:flex">
            <Group orientation="horizontal" className="flex flex-1">
              <Panel id="sidebar" defaultSize={272} minSize={220} maxSize={420}>
                <LoreSidebar
                  currentLoreId={lore.id}
                  notes={notes}
                  notesLoading={notesLoading}
                  notesError={notesError}
                  selectedNoteId={effectiveSelectedNoteId}
                  onSelectNote={setSelectedNoteId}
                  onCreateNote={handleCreateNote}
                  sources={sources}
                  sourcesLoading={sourcesLoading}
                  sourcesError={sourcesError}
                  uploadingSourceName={uploadingSourceName}
                  onUploadSource={handleUploadSource}
                />
              </Panel>
              <ResizeHandle />
              <Panel id="editor" minSize={420}>
                <NotePanel
                  notes={notes}
                  notesLoading={notesLoading}
                  notesError={notesError}
                  selectedNoteId={effectiveSelectedNoteId}
                  onCreateNote={() => handleCreateNote("Untitled", "")}
                  loreId={loreId}
                  activeProposal={activeProposal}
                  onNoteCreated={setSelectedNoteId}
                />
              </Panel>
              <ResizeHandle />
              <Panel id="chat" defaultSize={320} minSize={260} maxSize={440}>
                <LoreChatPanel
                  loreId={loreId}
                  notes={notes}
                  onActiveProposalChange={setActiveProposal}
                />
              </Panel>
            </Group>
          </div>

          {/* Small screens: document only, sidebar behind a toggle */}
          <div className="flex min-h-0 flex-1 lg:hidden">
            <NotePanel
              notes={notes}
              notesLoading={notesLoading}
              notesError={notesError}
              selectedNoteId={effectiveSelectedNoteId}
              onCreateNote={() => handleCreateNote("Untitled", "")}
              loreId={loreId}
              activeProposal={activeProposal}
              onNoteCreated={setSelectedNoteId}
            />
          </div>

          <LoreMobileSidebar
            currentLoreId={lore.id}
            notes={notes}
            notesLoading={notesLoading}
            notesError={notesError}
            selectedNoteId={effectiveSelectedNoteId}
            onSelectNote={setSelectedNoteId}
            onCreateNote={handleCreateNote}
            sources={sources}
            sourcesLoading={sourcesLoading}
            sourcesError={sourcesError}
            uploadingSourceName={uploadingSourceName}
            onUploadSource={handleUploadSource}
            open={mobileSidebarOpen}
            onOpenChange={setMobileSidebarOpen}
          />
        </>
      )}
    </div>
  );
}
