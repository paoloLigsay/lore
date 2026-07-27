"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRelativeTime } from "@/lib/utils";
import { useUpdateNote } from "@/hooks/use-update-note";
import { InlineRenameInput } from "./inline-rename-input";

export type NoteSummary = {
  id: string;
  loreId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const HEADING_OPTIONS = [
  { value: "paragraph", label: "Paragraph" },
  { value: "1", label: "Heading 1" },
  { value: "2", label: "Heading 2" },
  { value: "3", label: "Heading 3" },
  { value: "4", label: "Heading 4" },
  { value: "5", label: "Heading 5" },
  { value: "6", label: "Heading 6" },
] as const;

const HEADING_LABELS = Object.fromEntries(
  HEADING_OPTIONS.map((option) => [option.value, option.label])
);

// Save shortly after typing pauses, but never let continuous typing go
// unsaved longer than the max-wait cap.
const AUTOSAVE_DEBOUNCE_MS = 2000;
const AUTOSAVE_MAX_WAIT_MS = 10000;

export function NoteEditor({ note }: { note: NoteSummary }) {
  const [heading, setHeading] = useState<string>("paragraph");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const updateNoteMutation = useUpdateNote(note.loreId);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<string | null>(null);
  const lastSavedContentRef = useRef(note.content);

  function flush() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (maxWaitTimerRef.current) {
      clearTimeout(maxWaitTimerRef.current);
      maxWaitTimerRef.current = null;
    }
    const content = pendingContentRef.current;
    if (content === null || content === lastSavedContentRef.current) return;
    lastSavedContentRef.current = content;
    updateNoteMutation.mutate({ id: note.id, loreId: note.loreId, content });
  }

  function scheduleSave(content: string) {
    pendingContentRef.current = content;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(flush, AUTOSAVE_DEBOUNCE_MS);
    if (!maxWaitTimerRef.current) {
      maxWaitTimerRef.current = setTimeout(flush, AUTOSAVE_MAX_WAIT_MS);
    }
  }

  // Note.content is Markdown (see 02-schema.md) — the Markdown extension
  // parses it in as Tiptap's rich-text doc and serializes back out to
  // Markdown via editor.getMarkdown(), so what's typed/rendered here always
  // matches what the agent service reads/writes via get_note.
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: note.content,
    contentType: "markdown",
    immediatelyRender: false,
    onUpdate: ({ editor }) => scheduleSave(editor.getMarkdown()),
    editorProps: {
      attributes: {
        class:
          "min-h-full text-[14.5px] leading-[1.75] text-foreground outline-none [&_h1]:mt-5 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-base [&_h4]:font-bold [&_h5]:mt-3 [&_h5]:mb-2 [&_h5]:text-[15px] [&_h5]:font-bold [&_h6]:mt-3 [&_h6]:mb-2 [&_h6]:text-[13.5px] [&_h6]:font-bold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_.is-editor-empty:before]:pointer-events-none [&_.is-editor-empty:before]:float-left [&_.is-editor-empty:before]:h-0 [&_.is-editor-empty:before]:text-muted-foreground [&_.is-editor-empty:before]:content-[attr(data-placeholder)]",
      },
    },
  }, []);

  // `note` only changes by the parent remounting this component with a new
  // `key={note.id}` — flush any pending autosave immediately on unmount,
  // since switching notes remounts this component before the debounce
  // timer would otherwise fire.
  useEffect(() => {
    return () => {
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyHeading(value: string) {
    if (!editor) return;
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .setHeading({ level: Number(value) as 1 | 2 | 3 | 4 | 5 | 6 })
        .run();
    }
    setHeading(value);
  }

  return (
    <section className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        {/* Fixed height so swapping text <-> input never shifts the row —
            an <input> has different intrinsic line-height/box metrics
            than an <h2>, even with identical padding. */}
        <div className="flex h-5 min-w-0 flex-1 items-center">
          {isEditingTitle ? (
            <InlineRenameInput
              initialValue={note.title}
              onCommit={(title) => {
                updateNoteMutation.mutate({
                  id: note.id,
                  loreId: note.loreId,
                  title,
                });
                setIsEditingTitle(false);
              }}
              onCancel={() => setIsEditingTitle(false)}
              className="text-[13.5px] font-bold"
            />
          ) : (
            <h2
              onDoubleClick={() => setIsEditingTitle(true)}
              title="Double-click to rename"
              className="cursor-text truncate text-[13.5px] font-bold text-foreground"
            >
              {note.title}
            </h2>
          )}
        </div>
        <span className="shrink-0 text-xs text-ink-faint">
          {updateNoteMutation.isPending
            ? "Saving…"
            : `edited ${formatRelativeTime(note.updatedAt)}`}
        </span>
      </div>
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-2">
        <Select
          items={HEADING_LABELS}
          value={heading}
          onValueChange={(value) => {
            if (value) applyHeading(value);
          }}
        >
          <SelectTrigger className="w-32" disabled={!editor}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HEADING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mx-1 h-4 w-px bg-border" />

        <button
          type="button"
          aria-label="Bold"
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Bold className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Italic"
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Italic className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Bulleted list"
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <List className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
      <div className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <EditorContent editor={editor} />
      </div>
    </section>
  );
}
