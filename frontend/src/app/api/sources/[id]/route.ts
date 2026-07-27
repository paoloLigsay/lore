import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createStorageAdminClient, SOURCES_BUCKET } from "@/lib/supabase/storage";

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

  const source = await prisma.source.findUnique({
    where: { id },
    include: { lore: true },
  });

  if (!source) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  if (source.lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this source" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : null;

  if (title !== null && !title) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  const updated = await prisma.source.update({
    where: { id },
    data: {
      ...(title !== null && { title }),
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

  const source = await prisma.source.findUnique({
    where: { id },
    include: { lore: true },
  });

  if (!source) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  if (source.lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this source" },
      { status: 403 }
    );
  }

  if (source.storagePath) {
    const storage = createStorageAdminClient();
    await storage.storage.from(SOURCES_BUCKET).remove([source.storagePath]);
  }

  await prisma.source.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
