"use client";

import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatSummary } from "@/hooks/use-chats";
import { useCreateChat } from "@/hooks/use-create-chat";
import { useDeleteChat } from "@/hooks/use-delete-chat";

export function ChatTabStrip({
  loreId,
  chats,
  activeChatId,
  onSelectChat,
}: {
  loreId: string;
  chats: ChatSummary[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
}) {
  const createChat = useCreateChat(loreId);
  const deleteChat = useDeleteChat();

  function handleCreateChat() {
    const id = createChat.mutate();
    onSelectChat(id);
  }

  function handleDeleteChat(chat: ChatSummary) {
    deleteChat.mutate({ id: chat.id, loreId });
  }

  return (
    <div className="scrollbar-minimal flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-2">
      {chats.map((chat) => {
        const isActive = chat.id === activeChatId;
        const pending = Boolean(chat.pending);

        return (
          <div
            key={chat.id}
            aria-busy={pending}
            className={cn(
              "group flex h-7 max-w-40 shrink-0 items-center rounded-md transition-colors",
              pending
                ? "border border-dashed border-border/70 opacity-70"
                : isActive
                  ? "bg-accent-strong text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <button
              type="button"
              onClick={() => onSelectChat(chat.id)}
              disabled={pending}
              className="min-w-0 flex-1 truncate px-2.5 py-1 text-left text-[12.5px] font-medium outline-none"
            >
              {chat.title ?? "New chat"}
            </button>
            {!pending && (
              <button
                type="button"
                aria-label={`Delete ${chat.title ?? "chat"}`}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteChat(chat);
                }}
                className="mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-ink-faint opacity-0 outline-none transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={handleCreateChat}
        aria-label="New chat"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-faint outline-none transition-colors hover:bg-muted hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
