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

  // Note content is never mutated by anything other than this accept step —
  // see the diff-review hard invariant in CLAUDE.md — so applying diffAfter
  // (updating an existing note, or creating the proposed new one) and
  // flipping the proposal's status happen in one transaction. An
  // interactive transaction (not the array form) because the create branch
  // needs the newly created note's id to link back onto the proposal.
  const updatedProposal = await prisma.$transaction(async (tx) => {
    if (proposal.noteId) {
      await tx.note.update({
        where: { id: proposal.noteId },
        data: { content: proposal.diffAfter },
      });
      return tx.proposal.update({
        where: { id },
        data: { status: "ACCEPTED" },
      });
    }

    const note = await tx.note.create({
      data: {
        loreId: lore.id,
        title: proposal.noteTitle ?? "Untitled",
        content: proposal.diffAfter,
      },
    });
    return tx.proposal.update({
      where: { id },
      data: { status: "ACCEPTED", noteId: note.id },
    });
  });

  return NextResponse.json(updatedProposal);
}
