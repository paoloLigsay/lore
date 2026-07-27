"use client";

import { useMemo, useState } from "react";
import { Folder, Search } from "lucide-react";
import { LoreCard, LoreCardSkeleton } from "./lore-card";
import { AddLoreModal } from "./add-lore-modal";
import { EditLoreModal } from "./edit-lore-modal";
import { DeleteLoreDialog } from "./delete-lore-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useLores } from "@/hooks/use-lores";
import type { LoreSummary } from "./lore-card";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-accent-strong">
        <Folder className="h-5.5 w-5.5 text-foreground" strokeWidth={2} />
      </div>
      <h3 className="mb-1.5 text-lg font-bold text-foreground">
        No lores yet
      </h3>
      <p className="max-w-90 text-sm leading-relaxed text-muted-foreground">
        Start your first Lore to give it its own sources and an AI that helps
        you build it.
      </p>
    </div>
  );
}

function LoreGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <LoreCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardView() {
  const [search, setSearch] = useState("");
  const [editingLore, setEditingLore] = useState<LoreSummary | null>(null);
  const [deletingLore, setDeletingLore] = useState<LoreSummary | null>(null);
  const { data, isLoading, isError } = useLores();

  const filteredLores = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((lore) => lore.title.toLowerCase().includes(query));
  }, [data, search]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Your Lores
          </h1>
          {data ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {data.length} lore{data.length === 1 ? "" : "s"}
            </p>
          ) : (
            <Skeleton className="mt-1.5 h-4 w-16" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your lores"
              className="w-64 rounded-full border border-border bg-card py-2.25 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring"
            />
          </div>
          <AddLoreModal />
        </div>
      </div>

      {isLoading ? (
        <LoreGridSkeleton />
      ) : isError ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load your lores. Try refreshing the page.
        </p>
      ) : filteredLores.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLores.map((lore) => (
            <LoreCard
              key={lore.id}
              lore={lore}
              onEdit={setEditingLore}
              onDelete={setDeletingLore}
            />
          ))}
        </div>
      )}

      {editingLore && (
        <EditLoreModal
          lore={editingLore}
          open={Boolean(editingLore)}
          onOpenChange={(open) => {
            if (!open) setEditingLore(null);
          }}
        />
      )}

      {deletingLore && (
        <DeleteLoreDialog
          lore={deletingLore}
          open={Boolean(deletingLore)}
          onOpenChange={(open) => {
            if (!open) setDeletingLore(null);
          }}
        />
      )}
    </div>
  );
}
