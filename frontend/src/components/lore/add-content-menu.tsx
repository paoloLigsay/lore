"use client";

import { useRef } from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { FilePlus, Link2, Plus, StickyNote } from "lucide-react";
import { toast } from "sonner";

const SUPPORTED_SOURCE_EXTENSIONS = ["pdf", "txt", "md"];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Imported text is never trusted as HTML — every paragraph is escaped before
// being wrapped in markup, so a malicious file (even one renamed to .txt)
// can't inject a script into the note's stored content.
function textToNoteHtml(text: string) {
  return text
    .split(/\r?\n\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, "<br>")}</p>`
    )
    .join("");
}

const MENU_ITEM_CLASS =
  "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-foreground outline-none data-[highlighted]:bg-muted";

export function AddContentMenu({
  onCreateNote,
  onUploadSource,
}: {
  onCreateNote: (title: string, content: string) => void;
  onUploadSource: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const text = await file.text();
    const title = file.name.replace(/\.[^./]+$/, "") || "Imported note";
    onCreateNote(title, textToNoteHtml(text));
  }

  function handleImportSourceClick() {
    sourceInputRef.current?.click();
  }

  function handleSourceFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!SUPPORTED_SOURCE_EXTENSIONS.includes(ext)) {
      toast.error("Unsupported file type — upload a PDF, .txt, or .md file.");
      return;
    }

    onUploadSource(file);
  }

  return (
    <>
      <MenuPrimitive.Root>
        <MenuPrimitive.Trigger
          aria-label="Add to this Lore"
          className="flex h-6 w-6 items-center justify-center rounded-md text-ink-faint outline-none transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        </MenuPrimitive.Trigger>
        <MenuPrimitive.Portal>
          <MenuPrimitive.Positioner sideOffset={6} align="start">
            <MenuPrimitive.Popup className="z-50 min-w-[190px] rounded-lg border border-border bg-card p-1 text-card-foreground shadow-[0_16px_34px_-18px_rgba(0,0,0,0.25)] outline-none transition-all duration-100 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
              <MenuPrimitive.Item
                onClick={() => onCreateNote("Untitled", "")}
                className={MENU_ITEM_CLASS}
              >
                <StickyNote
                  className="h-3.5 w-3.5 text-ink-faint"
                  strokeWidth={2}
                />
                Create a note from scratch
              </MenuPrimitive.Item>
              <MenuPrimitive.Item
                onClick={handleImportClick}
                className={MENU_ITEM_CLASS}
              >
                <FilePlus
                  className="h-3.5 w-3.5 text-ink-faint"
                  strokeWidth={2}
                />
                Import a note
              </MenuPrimitive.Item>
              <MenuPrimitive.Item
                onClick={handleImportSourceClick}
                className={MENU_ITEM_CLASS}
              >
                <Link2 className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2} />
                Import a source
              </MenuPrimitive.Item>
            </MenuPrimitive.Popup>
          </MenuPrimitive.Positioner>
        </MenuPrimitive.Portal>
      </MenuPrimitive.Root>

      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.txt,text/plain,text/markdown"
        onChange={handleFileSelected}
        className="hidden"
      />
      <input
        ref={sourceInputRef}
        type="file"
        accept=".pdf,.md,.txt,application/pdf,text/plain,text/markdown"
        onChange={handleSourceFileSelected}
        className="hidden"
      />
    </>
  );
}
