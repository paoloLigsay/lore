import { NextRequest } from "next/server";
import { GET, POST } from "./route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    lore: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      upsert: jest.fn(),
    },
  },
}));

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const mockPrisma = prisma as unknown as {
  lore: { findMany: jest.Mock; create: jest.Mock };
  user: { upsert: jest.Mock };
};
const mockCreateClient = createClient as jest.Mock;

const USER_ID = "user-1";
const VALID_ID = "11111111-1111-1111-1111-111111111111";

function mockAuthedUser(user: { id: string; email: string } | null) {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user } }),
    },
  });
}

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/lores", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("GET /api/lores", () => {
  it("returns the lores list with counts", async () => {
    mockPrisma.lore.findMany.mockResolvedValue([
      { id: "lore-1", _count: { notes: 2, sources: 1 } },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(body.lores).toHaveLength(1);
    expect(mockPrisma.lore.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { updatedAt: "desc" } })
    );
  });
});

describe("POST /api/lores", () => {
  it("returns 401 when there is no authenticated user", async () => {
    mockAuthedUser(null);

    const response = await POST(postRequest({ id: VALID_ID, title: "Title" }));

    expect(response.status).toBe(401);
  });

  it("returns 400 when the client-generated id is not a valid uuid", async () => {
    mockAuthedUser({ id: USER_ID, email: "user@example.com" });

    const response = await POST(postRequest({ id: "not-a-uuid", title: "Title" }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when title is missing", async () => {
    mockAuthedUser({ id: USER_ID, email: "user@example.com" });

    const response = await POST(postRequest({ id: VALID_ID, title: "  " }));

    expect(response.status).toBe(400);
  });

  it("upserts the user before creating the lore", async () => {
    mockAuthedUser({ id: USER_ID, email: "user@example.com" });
    mockPrisma.lore.create.mockResolvedValue({
      id: VALID_ID,
      userId: USER_ID,
      title: "Title",
      description: null,
    });

    const response = await POST(
      postRequest({ id: VALID_ID, title: "Title", description: null })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
      where: { id: USER_ID },
      update: {},
      create: { id: USER_ID, email: "user@example.com" },
    });
    expect(mockPrisma.lore.create).toHaveBeenCalledWith({
      data: { id: VALID_ID, userId: USER_ID, title: "Title", description: null },
    });
    expect(body._count).toEqual({ notes: 0, sources: 0 });
  });
});
