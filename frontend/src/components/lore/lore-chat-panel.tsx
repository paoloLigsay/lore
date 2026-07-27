"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useChats } from "@/hooks/use-chats";
import {
  useChatMessages,
  type ChatMessageSummary,
  type ProposalSummary,
} from "@/hooks/use-chat-messages";
import { useSendChatMessage } from "@/hooks/use-send-chat-message";
import type { NoteSummary } from "./note-editor";
import { ChatTabStrip } from "./chat-tab-strip";

export type ActiveProposal = { proposal: ProposalSummary; chatId: string };

// Stable reference for a pending chat's "messages" — a fresh [] literal on
// every render would change identity each time and defeat effects/memos
// that key off `messages`.
const EMPTY_MESSAGES: ChatMessageSummary[] = [];

const EDIT_POINTER_LABEL: Record<ProposalSummary["status"], string> = {
  PENDING: "Proposed changes to",
  ACCEPTED: "Accepted changes to",
  REJECTED: "Rejected changes to",
};

const CREATE_POINTER_LABEL: Record<ProposalSummary["status"], string> = {
  PENDING: "Proposed a new note",
  ACCEPTED: "Created a new note",
  REJECTED: "Discarded the new note",
};

function ProposalPointer({
  proposal,
  noteTitle,
}: {
  proposal: ProposalSummary;
  noteTitle: string;
}) {
  // noteTitle is only ever set for a proposal that was creating a new note
  // — noteId starts out null for that case but flips to a real id once
  // accepted, so noteTitle (never cleared) is the stable way to tell "this
  // was always a create" apart from "this edits a note that already
  // existed," regardless of where in its lifecycle the proposal now is.
  const isCreate = proposal.noteTitle !== null;
  const label = isCreate ? CREATE_POINTER_LABEL : EDIT_POINTER_LABEL;
  return (
    <p className="text-[12px] italic text-ink-faint">
      {label[proposal.status]} &ldquo;{noteTitle}&rdquo;
      {proposal.status === "PENDING" && " — review it in the document panel."}
    </p>
  );
}

function ChatBubble({
  role,
  content,
  pending,
  statusLabel,
}: {
  role: "USER" | "ASSISTANT";
  content: string;
  pending?: boolean;
  statusLabel?: string | null;
}) {
  const isUser = role === "USER";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-card text-card-foreground shadow-[0_6px_18px_-10px_rgba(0,0,0,0.15)]"
        } ${pending ? "opacity-70" : ""}`}
      >
        {content ||
          (statusLabel ? (
            <span className="italic text-ink-faint animate-pulse">
              {statusLabel}
            </span>
          ) : pending ? (
            "…"
          ) : (
            ""
          ))}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="scrollbar-minimal flex flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-strong/15 text-ink-faint">
        <MessageCircle className="h-4.5 w-4.5" strokeWidth={1.8} />
      </div>
      <p className="text-[13px] font-semibold text-foreground">{title}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function LoreChatPanel({
  loreId,
  notes,
  onActiveProposalChange,
}: {
  loreId: string;
  notes: NoteSummary[];
  onActiveProposalChange: (active: ActiveProposal | null) => void;
}) {
  const [draft, setDraft] = useState("");
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(
    null
  );
  const [streamingText, setStreamingText] = useState("");
  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: chatsData } = useChats(loreId);
  const chats = chatsData ?? [];
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Same "fall back to the first" pattern as note selection in
  // lore-detail-view.tsx — lands on a real chat by default, and reflows
  // cleanly if the selected one is deleted.
  const activeChat = chats.find((chat) => chat.id === selectedChatId) ?? chats[0];
  const activeChatId = activeChat?.id ?? null;
  const isActiveChatPending = Boolean(activeChat?.pending);

  // A still-optimistic chat has no confirmed row yet, so fetching its
  // messages would just 404 (and nothing would ever retry it once the
  // create resolves) — skip the request and treat it as empty, which is
  // exactly what it is. Removes the loading/error flash a brand new chat
  // would otherwise show before settling.
  const {
    data: fetchedMessages,
    isLoading,
    isError,
  } = useChatMessages(activeChatId, { enabled: !isActiveChatPending });
  const messages = isActiveChatPending ? EMPTY_MESSAGES : fetchedMessages;
  const sendMessage = useSendChatMessage(activeChatId, loreId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pendingUserMessage, streamingText, statusLabel]);

  // The document panel (not this component) owns showing the diff — surface
  // whichever proposal is still open on this chat so the parent can drive
  // review mode there. Re-derived from the messages cache on every change,
  // so accept/reject (mutated elsewhere, in the document panel) clears it
  // here automatically once the cache reflects the resolved status.
  useEffect(() => {
    const openProposal = messages
      ?.slice()
      .reverse()
      .find((message) => message.proposal?.status === "PENDING")?.proposal;

    onActiveProposalChange(
      openProposal && activeChatId
        ? { proposal: openProposal, chatId: activeChatId }
        : null
    );
    // onActiveProposalChange intentionally omitted — it's a fresh closure
    // from the parent every render, and only messages/activeChatId should
    // trigger recomputation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeChatId]);

  // Auto-grow the textarea with content, capped by the max-h-32 class below.
  // overflow-y stays hidden until content actually exceeds that cap — a
  // textarea's default overflow can otherwise show a scrollbar the instant
  // scrollHeight >= clientHeight, which happens even for a single empty
  // line depending on the browser's row-height rounding.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const maxHeightPx = 128; // matches max-h-32
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeightPx ? "auto" : "hidden";
  }, [draft]);

  function submitMessage() {
    const message = draft.trim();
    if (!message || !activeChatId || sendMessage.isPending) return;

    setDraft("");
    setPendingUserMessage(message);
    setStreamingText("");
    setStatusLabel(null);

    sendMessage.mutate(
      {
        message,
        onToken: (text) => {
          setStreamingText((prev) => prev + text);
          setStatusLabel(null);
        },
        onStatus: (label) => setStatusLabel(label),
      },
      {
        onSettled: () => {
          setPendingUserMessage(null);
          setStreamingText("");
          setStatusLabel(null);
        },
      }
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    submitMessage();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden bg-muted/40">
      <ChatTabStrip
        loreId={loreId}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setSelectedChatId}
      />

      {!activeChatId ? (
        <EmptyState
          title="No chats yet"
          description="Start a chat to talk to the Supervisor about this Lore."
        />
      ) : isLoading ? (
        <div className="flex-1" />
      ) : isError ? (
        <EmptyState
          title="Couldn't load chat"
          description="Try refreshing the page."
        />
      ) : (
        <div
          ref={scrollRef}
          className="scrollbar-minimal flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3"
        >
          {messages?.length === 0 && !pendingUserMessage ? (
            <EmptyState
              title="Start the conversation"
              description="Ask about your notes and sources, or just talk through an idea."
            />
          ) : (
            <>
              {messages?.map((message) => (
                <div key={message.id} className="flex flex-col gap-1">
                  <ChatBubble role={message.role} content={message.content} />
                  {message.proposal && (
                    <ProposalPointer
                      proposal={message.proposal}
                      noteTitle={
                        message.proposal.noteTitle ??
                        notes.find((note) => note.id === message.proposal?.noteId)
                          ?.title ??
                        "a note"
                      }
                    />
                  )}
                </div>
              ))}
              {pendingUserMessage && (
                <ChatBubble role="USER" content={pendingUserMessage} />
              )}
              {pendingUserMessage && (
                <ChatBubble
                  role="ASSISTANT"
                  content={streamingText}
                  pending
                  statusLabel={statusLabel}
                />
              )}
            </>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!activeChatId || sendMessage.isPending}
          placeholder={activeChatId ? "Ask about this Lore…" : "Start a chat first"}
          className="max-h-32 flex-1 resize-none overflow-hidden rounded-2xl border border-border bg-background px-3.5 py-2 text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!activeChatId || !draft.trim() || sendMessage.isPending}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </form>
    </aside>
  );
}
