import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const TITLE_MAX_LENGTH = 60;

function titleFromMessage(message: string): string {
  const trimmed = message.trim();
  if (trimmed.length <= TITLE_MAX_LENGTH) return trimmed;
  return `${trimmed.slice(0, TITLE_MAX_LENGTH).trimEnd()}…`;
}

async function loadChatForUser(chatId: string, userId: string) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { lore: true },
  });

  if (!chat) {
    return { error: NextResponse.json({ error: "Chat not found" }, { status: 404 }) };
  }

  if (chat.lore.userId !== userId) {
    return {
      error: NextResponse.json(
        { error: "Not authorized to access this chat" },
        { status: 403 }
      ),
    };
  }

  return { chat };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await loadChatForUser(id, user.id);
  if (error) return error;

  const messages = await prisma.chatMessage.findMany({
    where: { chatId: id },
    orderBy: { createdAt: "asc" },
    include: { proposal: true },
  });

  return NextResponse.json({ messages });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { chat, error } = await loadChatForUser(id, user.id);
  if (error) return error;

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const history = await prisma.chatMessage.findMany({
    where: { chatId: id },
    orderBy: { createdAt: "asc" },
  });

  await prisma.chatMessage.create({
    data: { chatId: id, role: "USER", content: message },
  });

  if (chat.title === null) {
    await prisma.chat.update({
      where: { id },
      data: { title: titleFromMessage(message) },
    });
  }

  // Notes and sources aren't sent here — the agent fetches them on demand
  // via its list_notes/get_note/list_sources/get_source tools (see
  // /api/internal/*), so a turn's prompt only ever pays for what it uses.
  const agentResponse = await fetch(`${process.env.AGENT_SERVICE_URL}/agents/turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lore_id: chat.loreId,
      chat_history: history.map((entry) => ({
        role: entry.role === "USER" ? "user" : "assistant",
        content: entry.content,
      })),
      user_message: message,
    }),
  });

  if (!agentResponse.ok || !agentResponse.body) {
    return NextResponse.json({ error: "Agent service unavailable" }, { status: 502 });
  }

  const reader = agentResponse.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalMessage: string | null = null;
  let proposal: {
    agent: "RAG" | "WEB";
    note_id: string | null;
    note_title: string | null;
    diff_before: string;
    diff_after: string;
    explanation: string;
  } | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();

      if (done) {
        if (finalMessage !== null) {
          const assistantMessage = await prisma.chatMessage.create({
            data: { chatId: id, role: "ASSISTANT", content: finalMessage },
          });
          if (proposal !== null) {
            await prisma.proposal.create({
              data: {
                noteId: proposal.note_id,
                noteTitle: proposal.note_title,
                chatMessageId: assistantMessage.id,
                agent: proposal.agent,
                diffBefore: proposal.diff_before,
                diffAfter: proposal.diff_after,
                explanation: proposal.explanation,
              },
            });
          }
        }
        controller.close();
        return;
      }

      controller.enqueue(value);
      buffer += decoder.decode(value, { stream: true });

      let separatorIndex;
      while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);
        const lines = frame.split("\n");
        const eventLine = lines.find((line) => line.startsWith("event: "));
        const dataLine = lines.find((line) => line.startsWith("data: "));
        if (eventLine?.slice("event: ".length) === "result" && dataLine) {
          const parsed = JSON.parse(dataLine.slice("data: ".length));
          finalMessage = parsed.message;
          proposal = parsed.proposal;
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
