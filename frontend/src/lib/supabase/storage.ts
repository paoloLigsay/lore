import { createClient } from "@supabase/supabase-js";

// Secret key bypasses RLS — safe here because every caller (the sources API
// routes) already checks lore ownership via Prisma before touching Storage.
// Server-only: never prefix this env var with NEXT_PUBLIC_.
export function createStorageAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export const SOURCES_BUCKET = "lore";
