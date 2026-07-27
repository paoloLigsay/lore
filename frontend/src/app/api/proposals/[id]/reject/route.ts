import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    // note is only set once this targets an existing note — a proposal for
    // a brand new note (noteId null) has no note to include, so authorize
    // via chatMessage -> chat -> lore instead, which is always present.
    include: {
      note: { include: { lore: true } },
      chatMessage: { include: { chat: { include: { lore: true } } } },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const lore = proposal.note?.lore ?? proposal.chatMessage.chat.lore;

  if (lore.userId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to access this proposal" },
      { status: 403 }
    );
  }

  if (proposal.status !== "PENDING") {
    return NextResponse.json(
      { error: `Proposal already ${proposal.status.toLowerCase()}` },
      { status: 409 }
    );
  }

  const updatedProposal = await prisma.proposal.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  return NextResponse.json(updatedProposal);
}
