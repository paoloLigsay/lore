import Link from "next/link";
import { ArrowLeft, Folder, Menu } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { AccountMenu } from "@/components/layout/account-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { LoreSummary } from "@/components/dashboard/lore-card";

export function LorePageHeader({
  email,
  lore,
  isLoading,
  onOpenSidebar,
}: {
  email: string;
  lore: LoreSummary | undefined;
  isLoading: boolean;
  onOpenSidebar: () => void;
}) {
  return (
    <header className="border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            <Menu className="h-4 w-4" strokeWidth={2} />
          </button>
          <Link
            href="/dashboard"
            aria-label="Back to your lores"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </Link>

          {isLoading || !lore ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-accent-strong">
                <Folder className="h-4 w-4 text-foreground" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold leading-tight text-foreground">
                  {lore.title}
                </h1>
                <p className="truncate text-xs text-ink-faint">
                  {lore._count.notes}{" "}
                  {lore._count.notes === 1 ? "note" : "notes"} ·{" "}
                  {lore._count.sources}{" "}
                  {lore._count.sources === 1 ? "source" : "sources"} ·
                  updated {formatRelativeTime(lore.updatedAt)}
                </p>
              </div>
            </>
          )}
        </div>

        <AccountMenu email={email} />
      </div>
    </header>
  );
}
