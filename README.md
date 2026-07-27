# Lore

**Notes that know why.**

Lore is an AI-native notes app. Every note lives inside a "Lore" — a private
workspace with its own uploaded sources and a multi-agent chat that helps
write and edit the notes, grounded in those sources rather than generic
model knowledge. Every AI-proposed change shows up as a diff with
Accept/Reject — never a silent overwrite.

This is a solo-built portfolio MVP aimed at demonstrating technical depth
(clean architecture, a real multi-agent loop, a sane data model) on a
narrow, working scope — not a funded product. Full framing:
[docs/03-business-context.md](docs/03-business-context.md).

## Tech stack

- **Frontend / BFF**: Next.js (App Router), TanStack Query for client caching
- **Database**: Postgres via Supabase, schema managed with Prisma
- **Agent runtime**: Python (FastAPI + LangGraph) — a Supervisor agent that
  delegates to RAG and Web specialists, with a Synthesizer as a mandatory
  final pass. Deployed as a [Vercel Service](https://vercel.com/docs/services)
  alongside the Next.js app — one project, not two hosts.
- **Sources**: no vector store — a source's extracted text is stored on its
  row and fetched on demand by the Supervisor via tool calls. See "Why no
  embeddings" in [docs/01-architecture.md](docs/01-architecture.md).
- **Auth**: Supabase Auth

## Repo layout

```
/lore
  vercel.json      # services + rewrites
  /frontend        # Next.js app (pnpm)
  /agents          # FastAPI + LangGraph agent service (uv)
  /docs
```

## Running locally

Requires: Node + [pnpm](https://pnpm.io), Python 3.12+ with
[uv](https://docs.astral.sh/uv/), and a Supabase project (Postgres + Auth +
Storage).

Copy your Supabase/Anthropic/Tavily credentials into a `.env` file at the
repo root (see [Environment variables](#environment-variables) below) — both
services read from it.

**Together**, via the Vercel CLI (mirrors production routing):

```bash
vercel dev
```

**Separately:**

```bash
# frontend — http://localhost:3000
cd frontend && pnpm install && pnpm dev

# agents — http://localhost:8000
cd agents && uv sync && uv run uvicorn main:app --reload --port 8000
```

Database schema changes go through Prisma in `/frontend` (`pnpm prisma
migrate dev`, etc.) — Prisma owns every table, the agent service never
talks to Postgres directly.

## Environment variables

| Variable | Used by |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | frontend (Prisma) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL` | frontend (Supabase Auth) |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | agents |
| `TAVILY_API_KEY` | agents (Web specialist) |
| `AGENT_SERVICE_INTERNAL_KEY` | both — shared secret gating the agent service's callback into Next.js's internal API |
| `NEXTJS_INTERNAL_URL` | agents — base URL for that callback |

## Docs

- [docs/01-architecture.md](docs/01-architecture.md) — system design, the
  Supervisor/RAG/Web/Synthesizer agent graph, data flow, hosting
- [docs/02-schema.md](docs/02-schema.md) — Prisma schema, Next.js API
  routes, agent service request/response contracts
- [docs/03-business-context.md](docs/03-business-context.md) — the problem,
  who it's for, v1 scope and non-goals
- [docs/04-design.md](docs/04-design.md) — palette, type scale,
  shape/elevation, layout

## Deployment

Both services deploy to Vercel as one project. See the "Hosting" section of
[docs/01-architecture.md](docs/01-architecture.md) for why one platform is
enough at this project's scale.
