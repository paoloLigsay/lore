import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalKey } from "@/lib/internal-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireInternalKey(request);
  if (authError) return authError;

  const { id } = await params;
  const loreId = request.nextUrl.searchParams.get("loreId");

  const note = await prisma.note.findUnique({
    where: { id },
    select: { id: true, title: true, content: true, loreId: true },
  });

  // Scoped to the lore the agent's turn started from — a note id from a
  // different lore is treated as not found, not just unauthorized, so a
  // model that guesses/leaks an id can't confirm it exists elsewhere.
  if (!note || note.loreId !== loreId) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: note.id,
    title: note.title,
    content: note.content,
  });
}
