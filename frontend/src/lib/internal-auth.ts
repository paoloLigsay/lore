import { NextRequest, NextResponse } from "next/server";

/**
 * Gate for the /api/internal/* routes: the agent service (no Supabase
 * session) calls these to fetch note/source data on demand for its tools.
 * Not a substitute for user auth — callers must additionally scope by the
 * lore_id the original /agents/turn request was made for (see each route).
 */
export function requireInternalKey(request: NextRequest): NextResponse | null {
  const key = request.headers.get("x-internal-key");
  if (!key || key !== process.env.AGENT_SERVICE_INTERNAL_KEY) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  return null;
}
