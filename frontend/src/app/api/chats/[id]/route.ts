import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

  const chat = await prisma.chat.findUnique({
    where: { id },
    include: { lore: true },
  });

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  if (chat.lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this chat" },
      { status: 403 }
    );
  }

  await prisma.chat.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
