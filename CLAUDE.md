# Lore — Project Context

## What this is

Lore is an AI-native notes app. Every note lives inside a "Lore" — a private
workspace with its own uploaded sources and a multi-agent chat that helps
write and edit the notes, grounded in those sources. Full product framing:
[docs/03-business-context.md](docs/03-business-context.md).

This is a solo-built portfolio MVP aimed at a future hiring manager, not a
funded startup. Optimize for depth and craft on a narrow, working scope over
breadth. See the business-context doc for what that means in practice.

## Tech stack

- **Frontend / BFF**: Next.js (App Router), TanStack Query for client caching
- **State**: Zustand for client-only UI state (not server data — that's TanStack Query's job)
- **Database**: Postgres via Supabase, schema managed with Prisma
- **Agent runtime**: Python (FastAPI + LangGraph), deployed as a Vercel
  Service in the same project as the Next.js app — one platform, not two
- **Sources**: no vector store / embeddings in v1 — a source's extracted
  text is stored on its `Source` row and included directly in agent prompts
  ("context stuffing"). See "Why no embeddings" in
  [docs/01-architecture.md](docs/01-architecture.md).
- **Auth**: Supabase Auth

Full rationale, including why one Vercel project is enough (no separate
backend host needed at this project's scale), and the assumption still
flagged for your review (web-search provider) are in
[docs/01-architecture.md](docs/01-architecture.md).

## Docs

Read these before non-trivial work — they carry decisions this file only
summarizes:

- [docs/01-architecture.md](docs/01-architecture.md) — system design, the
  Supervisor/RAG/Web/Synthesizer agent graph, data flow, service boundary
- [docs/02-schema.md](docs/02-schema.md) — Prisma schema, Next.js API routes,
  agent service request/response contracts
- [docs/03-business-context.md](docs/03-business-context.md) — what problem
  this solves, who it's for, v1 scope and non-goals
- [docs/04-design.md](docs/04-design.md) — palette, type scale, shape/elevation,
  layout, pulled from `landing-page-draft-1.html`

## Project-specific guardrails

- **The accept/reject diff is a hard invariant, not a UI nicety.** No code
  path may write AI-generated content directly into a Note's `content`
  field. Every change from any agent goes through a `Proposal` row and the
  accept step in [docs/02-schema.md](docs/02-schema.md). If you're about to
  write code that patches note content outside that path, stop and reread
  the schema doc.
- **Supervisor, RAG, Web, and Synthesizer are all in v1 scope** — see
  [docs/03-business-context.md](docs/03-business-context.md). RAG and Web
  are delegation tools the Supervisor calls, not separate graph nodes;
  Synthesizer is a mandatory final pass, not a specialist picked instead of
  them. Don't quietly descope back to RAG-only; if scope needs to shrink,
  that's a conversation, not a silent decision.
- **Prisma owns every table, no exceptions.** There's no vector/embeddings
  table and no Prisma-bypass data path — the agent service never talks to
  Postgres directly. See "Sources → text extraction pipeline" in
  [docs/01-architecture.md](docs/01-architecture.md).
- **Design tokens come from `docs/04-design.md`, not invented ad hoc.** The
  landing page already establishes a specific warm-neutral, oklch-based
  palette and type scale — new UI should extend it, not introduce a second
  visual language.
- **No inline `useQuery`/`useMutation` in components.** Every query and
  mutation is its own hook under `frontend/src/hooks/`; components only call
  the hook. See "Frontend data layer conventions" in
  [docs/01-architecture.md](docs/01-architecture.md).
- Global engineering conventions (error handling, naming, no premature
  abstraction, etc.) live in the user's global `CLAUDE.md` and apply here
  without repeating them.