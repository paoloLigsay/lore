import { NextRequest } from "next/server";
import { POST } from "./route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    proposal: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    note: {
      update: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const mockPrisma = prisma as unknown as {
  proposal: { findUnique: jest.Mock; update: jest.Mock };
  note: { update: jest.Mock; create: jest.Mock };
  $transaction: jest.Mock;
};
const mockCreateClient = createClient as jest.Mock;

const USER_ID = "user-1";
const OTHER_USER_ID = "user-2";
const PROPOSAL_ID = "proposal-1";

function mockAuthedUser(userId: string | null) {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }),
    },
  });
}

function callRoute() {
  const request = new NextRequest(`http://localhost/api/proposals/${PROPOSAL_ID}/accept`, {
    method: "POST",
  });
  return POST(request, { params: Promise.resolve({ id: PROPOSAL_ID }) });
}

function baseProposal(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: PROPOSAL_ID,
    noteId: "note-1",
    noteTitle: null,
    chatMessageId: "message-1",
    agent: "RAG",
    diffBefore: "old content",
    diffAfter: "new content",
    explanation: "because",
    status: "PENDING",
    createdAt: new Date(),
    note: { id: "note-1", lore: { id: "lore-1", userId: USER_ID } },
    chatMessage: { chat: { lore: { id: "lore-1", userId: USER_ID } } },
    ...overrides,
  };
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("POST /api/proposals/[id]/accept", () => {
  it("returns 401 when there is no authenticated user", async () => {
    mockAuthedUser(null);

    const response = await callRoute();

    expect(response.status).toBe(401);
    expect(mockPrisma.proposal.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the proposal does not exist", async () => {
    mockAuthedUser(USER_ID);
    mockPrisma.proposal.findUnique.mockResolvedValue(null);

    const response = await callRoute();

    expect(response.status).toBe(404);
  });

  it("returns 403 when the lore belongs to a different user (existing-note path)", async () => {
    mockAuthedUser(OTHER_USER_ID);
    mockPrisma.proposal.findUnique.mockResolvedValue(baseProposal());

    const response = await callRoute();

    expect(response.status).toBe(403);
  });

  it("returns 403 via the chatMessage->chat->lore path when noteId is null", async () => {
    mockAuthedUser(OTHER_USER_ID);
    mockPrisma.proposal.findUnique.mockResolvedValue(
      baseProposal({ noteId: null, note: null })
    );

    const response = await callRoute();

    expect(response.status).toBe(403);
  });

  it("returns 409 when the proposal is no longer pending", async () => {
    mockAuthedUser(USER_ID);
    mockPrisma.proposal.findUnique.mockResolvedValue(
      baseProposal({ status: "ACCEPTED" })
    );

    const response = await callRoute();
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("accepted");
  });

  it("updates the existing note's content and marks the proposal ACCEPTED", async () => {
    mockAuthedUser(USER_ID);
    const proposal = baseProposal();
    mockPrisma.proposal.findUnique.mockResolvedValue(proposal);

    const updatedProposal = { ...proposal, status: "ACCEPTED" };
    mockPrisma.$transaction.mockImplementation(async (fn) => {
      const tx = {
        note: { update: mockPrisma.note.update, create: mockPrisma.note.create },
        proposal: { update: mockPrisma.proposal.update.mockResolvedValue(updatedProposal) },
      };
      return fn(tx);
    });

    const response = await callRoute();

    expect(response.status).toBe(200);
    expect(mockPrisma.note.update).toHaveBeenCalledWith({
      where: { id: "note-1" },
      data: { content: "new content" },
    });
    expect(mockPrisma.note.create).not.toHaveBeenCalled();
    expect(mockPrisma.proposal.update).toHaveBeenCalledWith({
      where: { id: PROPOSAL_ID },
      data: { status: "ACCEPTED" },
    });
  });

  it("creates a new note and links it back onto the proposal when noteId is null", async () => {
    mockAuthedUser(USER_ID);
    const proposal = baseProposal({
      noteId: null,
      noteTitle: "Brand new note",
      note: null,
    });
    mockPrisma.proposal.findUnique.mockResolvedValue(proposal);

    const createdNote = { id: "new-note-1" };
    const updatedProposal = { ...proposal, status: "ACCEPTED", noteId: createdNote.id };
    mockPrisma.$transaction.mockImplementation(async (fn) => {
      const tx = {
        note: {
          update: mockPrisma.note.update,
          create: mockPrisma.note.create.mockResolvedValue(createdNote),
        },
        proposal: { update: mockPrisma.proposal.update.mockResolvedValue(updatedProposal) },
      };
      return fn(tx);
    });

    const response = await callRoute();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.note.create).toHaveBeenCalledWith({
      data: { loreId: "lore-1", title: "Brand new note", content: "new content" },
    });
    expect(mockPrisma.proposal.update).toHaveBeenCalledWith({
      where: { id: PROPOSAL_ID },
      data: { status: "ACCEPTED", noteId: createdNote.id },
    });
    expect(body.noteId).toBe(createdNote.id);
  });
});
