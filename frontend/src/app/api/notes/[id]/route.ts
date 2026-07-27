import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
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

  const note = await prisma.note.findUnique({
    where: { id },
    include: { lore: true },
  });

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  if (note.lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this note" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : null;
  const content = typeof body?.content === "string" ? body.content : null;

  if (title !== null && !title) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  const updated = await prisma.note.update({
    where: { id },
    data: {
      ...(title !== null && { title }),
      ...(content !== null && { content }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
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

  const note = await prisma.note.findUnique({
    where: { id },
    include: { lore: true },
  });

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  if (note.lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this note" },
      { status: 403 }
    );
  }

  await prisma.note.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
