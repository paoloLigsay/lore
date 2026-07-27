import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: loreId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const lore = await prisma.lore.findUnique({ where: { id: loreId } });

  if (!lore) {
    return NextResponse.json({ error: "Lore not found" }, { status: 404 });
  }

  if (lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this lore" },
      { status: 403 }
    );
  }

  // Oldest first — new chats join at the end of the tab strip, not the start.
  const chats = await prisma.chat.findMany({
    where: { loreId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ chats });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: loreId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const lore = await prisma.lore.findUnique({ where: { id: loreId } });

  if (!lore) {
    return NextResponse.json({ error: "Lore not found" }, { status: 404 });
  }

  if (lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this lore" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // id is client-generated so the optimistically-rendered chat tab and the
  // confirmed row share one identity — same pattern as note creation, see
  // "Optimistic creates" in docs/01-architecture.md. title starts null and
  // is filled in from the first message, see chats/[id]/messages/route.ts.
  const chat = await prisma.chat.create({
    data: { id, loreId, title: null },
  });

  return NextResponse.json(chat, { status: 201 });
}
