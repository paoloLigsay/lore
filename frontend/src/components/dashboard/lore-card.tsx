import Link from "next/link";
import { Folder, Loader2, Pencil, Trash2 } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type LoreSummary = {
  id: string;
  title: string;
  description: string | null;
  updatedAt: string;
  _count: { notes: number; sources: number };
  // Client-only: set on the optimistic entry while a create is in flight,
  // never present on data from the API. Keeps the row visible but inert —
  // no click/link — until the server confirms it exists.
  pending?: boolean;
};

export function LoreCard({
  lore,
  onEdit,
  onDelete,
}: {
  lore: LoreSummary;
  onEdit?: (lore: LoreSummary) => void;
  onDelete?: (lore: LoreSummary) => void;
}) {
  const pending = Boolean(lore.pending);

  return (
    <div
      aria-busy={pending}
      className={cn(
        "relative flex flex-col rounded-lg border p-6 transition-[opacity,border-color,box-shadow] duration-200",
        pending
          ? "pointer-events-none border-dashed border-border/70 bg-card/60 opacity-70"
          : "border-border bg-card shadow-[0_6px_18px_-10px_rgba(0,0,0,0.15)] hover:border-foreground/15 hover:shadow-[0_16px_34px_-18px_rgba(0,0,0,0.25)]"
      )}
    >
      {!pending && (
        <Link
          href={`/lore/${lore.id}`}
          aria-label={`Open ${lore.title}`}
          className="absolute inset-0 z-0 rounded-lg"
        />
      )}
      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col",
          !pending && "pointer-events-none"
        )}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-accent-strong">
            <Folder className="h-4.5 w-4.5 text-foreground" strokeWidth={2} />
          </div>
          {pending ? (
            <span className="flex items-center gap-1 text-xs text-ink-faint">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="sr-only">Creating</span>
            </span>
          ) : (
            <div className="pointer-events-auto flex gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(lore)}
                  aria-label="Edit lore"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(lore)}
                  aria-label="Delete lore"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
          )}
        </div>
        <h3 className="mb-1.5 text-lg font-bold text-card-foreground">
          {lore.title}
        </h3>
        {lore.description ? (
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {lore.description}
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between">
          {pending ? (
            <p className="text-sm italic text-ink-faint">Creating…</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {lore._count.notes} {lore._count.notes === 1 ? "note" : "notes"} ·{" "}
              {lore._count.sources}{" "}
              {lore._count.sources === 1 ? "source" : "sources"}
            </p>
          )}
          {!pending && (
            <span className="text-xs text-ink-faint">
              {formatRelativeTime(lore.updatedAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoreCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-[0_6px_18px_-10px_rgba(0,0,0,0.15)]">
      <div className="mb-4 flex items-start justify-between">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-3.5 w-10" />
      </div>
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-1.5 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}
