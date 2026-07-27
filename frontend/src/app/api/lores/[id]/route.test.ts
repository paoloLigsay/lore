import { NextRequest } from "next/server";
import { GET, PATCH, DELETE } from "./route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    lore: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const mockPrisma = prisma as unknown as {
  lore: { findUnique: jest.Mock; update: jest.Mock; delete: jest.Mock };
};
const mockCreateClient = createClient as jest.Mock;

const USER_ID = "user-1";
const OTHER_USER_ID = "user-2";
const LORE_ID = "lore-1";

function mockAuthedUser(userId: string | null) {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }),
    },
  });
}

function params() {
  return { params: Promise.resolve({ id: LORE_ID }) };
}

function patchRequest(body: unknown) {
  return new NextRequest(`http://localhost/api/lores/${LORE_ID}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

function baseLore(overrides: Partial<Record<string, unknown>> = {}) {
  return { id: LORE_ID, userId: USER_ID, title: "Title", description: null, ...overrides };
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("GET /api/lores/[id]", () => {
  it("returns 401 when there is no authenticated user", async () => {
    mockAuthedUser(null);

    const response = await GET(new NextRequest(`http://localhost/api/lores/${LORE_ID}`), params());

    expect(response.status).toBe(401);
  });

  it("returns 404 when the lore does not exist", async () => {
    mockAuthedUser(USER_ID);
    mockPrisma.lore.findUnique.mockResolvedValue(null);

    const response = await GET(new NextRequest(`http://localhost/api/lores/${LORE_ID}`), params());

    expect(response.status).toBe(404);
  });

  it("returns 403 when the lore belongs to a different user", async () => {
    mockAuthedUser(OTHER_USER_ID);
    mockPrisma.lore.findUnique.mockResolvedValue(baseLore());

    const response = await GET(new NextRequest(`http://localhost/api/lores/${LORE_ID}`), params());

    expect(response.status).toBe(403);
  });

  it("returns the lore on success", async () => {
    mockAuthedUser(USER_ID);
    mockPrisma.lore.findUnique.mockResolvedValue(baseLore());

    const response = await GET(new NextRequest(`http://localhost/api/lores/${LORE_ID}`), params());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe(LORE_ID);
  });
});

describe("PATCH /api/lores/[id]", () => {
  it("returns 401 when there is no authenticated user", async () => {
    mockAuthedUser(null);

    const response = await PATCH(patchRequest({ title: "New title" }), params());

    expect(response.status).toBe(401);
  });

  it("returns 404 when the lore does not exist", async () => {
    mockAuthedUser(USER_ID);
    mockPrisma.lore.findUnique.mockResolvedValue(null);

    const response = await PATCH(patchRequest({ title: "New title" }), params());

    expect(response.status).toBe(404);
  });

  it("returns 403 when the lore belongs to a different user", async () => {
    mockAuthedUser(OTHER_USER_ID);
    mockPrisma.lore.findUnique.mockResolvedValue(baseLore());

    const response = await PATCH(patchRequest({ title: "New title" }), params());

    expect(response.status).toBe(403);
  });

  it("returns 400 when title is set to an empty string", async () => {
    mockAuthedUser(USER_ID);
    mockPrisma.lore.findUnique.mockResolvedValue(baseLore());

    const response = await PATCH(patchRequest({ title: "   " }), params());

    expect(response.status).toBe(400);
  });

  it("updates the lore on success", async () => {
    mockAuthedUser(USER_ID);
    mockPrisma.lore.findUnique.mockResolvedValue(baseLore());
    mockPrisma.lore.update.mockResolvedValue(baseLore({ title: "New title" }));

    const response = await PATCH(patchRequest({ title: "New title" }), params());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.title).toBe("New title");
    expect(mockPrisma.lore.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: LORE_ID },
        data: { title: "New title" },
      })
    );
  });
});

describe("DELETE /api/lores/[id]", () => {
  it("returns 401 when there is no authenticated user", async () => {
    mockAuthedUser(null);

    const response = await DELETE(
      new NextRequest(`http://localhost/api/lores/${LORE_ID}`, { method: "DELETE" }),
      params()
    );

    expect(response.status).toBe(401);
  });

  it("returns 404 when the lore does not exist", async () => {
    mockAuthedUser(USER_ID);
    mockPrisma.lore.findUnique.mockResolvedValue(null);

    const response = await DELETE(
      new NextRequest(`http://localhost/api/lores/${LORE_ID}`, { method: "DELETE" }),
      params()
    );

    expect(response.status).toBe(404);
  });

  it("returns 403 when the lore belongs to a different user", async () => {
    mockAuthedUser(OTHER_USER_ID);
    mockPrisma.lore.findUnique.mockResolvedValue(baseLore());

    const response = await DELETE(
      new NextRequest(`http://localhost/api/lores/${LORE_ID}`, { method: "DELETE" }),
      params()
    );

    expect(response.status).toBe(403);
  });

  it("deletes the lore on success", async () => {
    mockAuthedUser(USER_ID);
    mockPrisma.lore.findUnique.mockResolvedValue(baseLore());

    const response = await DELETE(
      new NextRequest(`http://localhost/api/lores/${LORE_ID}`, { method: "DELETE" }),
      params()
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrisma.lore.delete).toHaveBeenCalledWith({ where: { id: LORE_ID } });
  });
});
