import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

  const lore = await prisma.lore.findUnique({
    where: { id },
    include: {
      _count: {
        select: { notes: true, sources: true },
      },
    },
  });

  if (!lore) {
    return NextResponse.json({ error: "Lore not found" }, { status: 404 });
  }

  if (lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this lore" },
      { status: 403 }
    );
  }

  return NextResponse.json(lore);
}

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

  const lore = await prisma.lore.findUnique({
    where: { id },
  });

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
  const title = typeof body?.title === "string" ? body.title.trim() : null;
  const description =
    typeof body?.description === "string" ? body.description.trim() : null;

  if (title !== null && !title) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  const updated = await prisma.lore.update({
    where: { id },
    data: {
      ...(title !== null && { title }),
      ...(description !== null && { description: description || null }),
    },
    include: {
      _count: {
        select: { notes: true, sources: true },
      },
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

  const lore = await prisma.lore.findUnique({
    where: { id },
  });

  if (!lore) {
    return NextResponse.json({ error: "Lore not found" }, { status: 404 });
  }

  if (lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this lore" },
      { status: 403 }
    );
  }

  await prisma.lore.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
