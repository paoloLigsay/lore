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

  const notes = await prisma.note.findMany({
    where: { loreId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ notes });
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
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.content === "string" ? body.content : "";

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // id is client-generated so the optimistically-rendered note and the
  // confirmed row share one identity — see "Optimistic creates" in
  // docs/01-architecture.md.
  const note = await prisma.note.create({
    data: { id, loreId, title, content },
  });

  return NextResponse.json(note, { status: 201 });
}
