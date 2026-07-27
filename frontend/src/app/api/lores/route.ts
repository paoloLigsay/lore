import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET() {
  const lores = await prisma.lore.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { notes: true, sources: true },
      },
    },
  });

  return NextResponse.json({ lores });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : null;

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Prisma's User row mirrors auth.users but isn't created by a Supabase
  // trigger, so it must exist before a Lore can reference it via FK.
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email! },
  });

  // id is client-generated (not Prisma's @default(uuid())) so the
  // optimistically-rendered card and the confirmed row share one identity —
  // see "Frontend data layer conventions" in docs/01-architecture.md.
  const lore = await prisma.lore.create({
    data: { id, userId: user.id, title, description: description || null },
  });

  return NextResponse.json(
    { ...lore, _count: { notes: 0, sources: 0 } },
    { status: 201 }
  );
}
