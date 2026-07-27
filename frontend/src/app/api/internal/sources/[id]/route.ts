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

  const source = await prisma.source.findUnique({
    where: { id },
    select: { id: true, title: true, content: true, loreId: true, status: true },
  });

  // Scoped to the lore the agent's turn started from — see notes/[id]/route.ts.
  if (!source || source.loreId !== loreId || source.status !== "READY") {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: source.id,
    title: source.title,
    content: source.content ?? "",
  });
}
