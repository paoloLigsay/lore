import { execFileSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";
import type { APIRequestContext } from "@playwright/test";

// PW (the e2e test account's password) lives in the repo-root .env, not
// frontend/.env — the default `dotenv/config` (which loads relative to
// cwd) never picks it up.
dotenv.config({ path: path.join(__dirname, "../../.env") });

const SEED_CLI_PATH = path.join(__dirname, "seed-cli.ts");

export async function resolveTestUserId(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string> {
  const response = await request.post(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
      data: { email, password },
    }
  );

  if (!response.ok()) {
    throw new Error(
      `Failed to resolve test user id: ${response.status()} ${await response.text()}`
    );
  }

  const body = await response.json();
  return body.user.id as string;
}

// Shells out to a plain tsx-run script rather than importing "@/lib/prisma"
// directly — the generated Prisma client is ESM (`import.meta`), which
// Playwright's own CJS test transform can't load.
export function seedPendingProposal(args: {
  userId: string;
  email: string;
  noteBefore: string;
  noteAfter: string;
}): { loreId: string; noteId: string } {
  const output = execFileSync(
    "npx",
    ["tsx", SEED_CLI_PATH, "seed", JSON.stringify(args)],
    { encoding: "utf-8" }
  );
  return JSON.parse(output);
}

export function cleanupLore(loreId: string): void {
  execFileSync("npx", ["tsx", SEED_CLI_PATH, "cleanup", loreId], { encoding: "utf-8" });
}
