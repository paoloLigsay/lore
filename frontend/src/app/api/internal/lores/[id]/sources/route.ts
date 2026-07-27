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
  const sources = await prisma.source.findMany({
    where: { loreId: id, status: "READY" },
    select: { id: true, title: true },
  });

  return NextResponse.json({ sources });
}
