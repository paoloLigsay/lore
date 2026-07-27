# Architecture

## System overview

Two logical services, one Vercel project:

- **Web app (Next.js)** — UI, auth, and all CRUD (Lores, Notes, Sources,
  Messages, Proposals) via API routes backed by Prisma/Postgres. Owns all
  relational data.
- **Agent service (Python + FastAPI + LangGraph)** — stateless request/response
  service that runs the Supervisor graph for a chat turn or an ingestion job.
  Deployed as a [Vercel Service](https://vercel.com/docs/services) alongside
  the Next.js app, so both ship from the same project/deploy instead of a
  separate platform. Called by the Next.js API, never called directly from
  the browser.

```
Browser (Next.js UI, TanStack Query)
   │
   ▼
Next.js API routes  ──CRUD──▶  Postgres (Supabase) via Prisma
   │                       └─▶  Supabase Storage (uploaded source files)
   │
   │  POST /agents/turn  (this Lore's id + chat history for one of its Chats)
   ▼
Python agent service (FastAPI + LangGraph, Vercel Python runtime)
   │
   └─▶ Web search API (Web agent only)
```

Rationale for splitting into two codebases rather than running LangGraph
inside a Next.js API route: LangGraph's mature runtime is Python, and keeping
agent orchestration separate means it can be iterated on independently of the
web app — without needing a separate hosting platform to do it. Both a chat
turn (a bounded, few-second Supervisor loop) and an ingestion job (extract →
chunk → embed → save) are ordinary in-memory work inside a single
request/response — nothing here needs a persistent background worker at this
project's scale. See "Hosting" below.

## Agent graph

Built as a single LangGraph graph: a Supervisor node, a shared tool-execution
node, and a Synthesizer node that always runs last. There is no separate
graph node per specialist — RAG and Web are implemented as two of the
Supervisor's own tools (the standard LangGraph "supervisor with sub-agents
wrapped as tools" pattern, appropriate here because neither specialist ever
converses with the user directly):

- **Supervisor** — entry point. Holds this turn's `Chat` history and the
  Lore it belongs to; no note or source text is preloaded — it fetches
  whichever ones it needs via `list_notes`/`get_note`/`list_sources`/
  `get_source` (see "On-demand note/source tools" in
  [02-schema.md](02-schema.md)). Also holds the guardrails: staying on
  topic/declining unsafe requests, and treating fetched note/source content
  as untrusted data rather than instructions (prompt-injection resistance).
  For a note change, it calls one of two delegation tools:
  - **`draft_with_rag`** — runs a nested tool-calling agent (its own
    `list_notes`/`get_note`/`list_sources`/`get_source` access) that drafts
    a change grounded in this Lore's own notes/uploaded sources. The
    default path — what makes answers grounded in the user's own sources
    rather than generic model knowledge.
  - **`draft_with_web`** — runs a nested agent with note-read access plus a
    live web search tool (Tavily), used when the Supervisor decides the
    uploaded sources don't cover the request.

  Each returns a structured `{note_id, note_title, diff_before, diff_after,
  explanation}` once its nested agent's tool-calling loop finishes —
  `note_id` targets an existing note (found via `list_notes`/`get_note`);
  leaving it `null` and setting `note_title` instead proposes a brand new
  note rather than editing one that already exists. The Supervisor can call
  either again (e.g. to try the other specialist) before finishing — the
  existing `recursion_limit` on the graph run is the current backstop against
  runaway loops; a dedicated hop counter is not implemented yet.
- **Synthesizer** — a fixed final node, not a specialist the Supervisor picks
  between. It always runs once the Supervisor stops calling tools (whether or
  not a specialist drafted anything), and writes the single reply the user
  sees — the Supervisor's own pre-Synthesizer text is never shown. If a
  specialist drafted a change, the Synthesizer's explanation of it (not the
  diff text itself, which passes through unchanged) becomes the proposal's
  `explanation`.

The Supervisor is the only node whose text ever reaches the user (via the
Synthesizer); specialists never write directly to the note — only a
finalized proposal, built from a specialist's structured output, can.

### Why tools, not nodes

This was a deliberate choice between two real, documented LangGraph
patterns, not the only way to build this graph:

- **Specialists as their own graph nodes**, reached via a handoff tool that
  returns `Command(goto="rag_node", graph=Command.PARENT)` — what the
  `langgraph-supervisor` prebuilt library does. Real, still works.
- **Specialists wrapped as plain tools** (what's built here) — each
  specialist is its own `create_react_agent(...)`, invoked synchronously
  inside a `@tool` function; the Supervisor never sees its internal steps,
  just the final structured result.

`langgraph-supervisor`'s own README now says to prefer the tools-based
approach "for most use cases," and LangChain's current supervisor guide
(`docs.langchain.com/oss/python/langchain/supervisor`) documents only the
tools-based version — the node/`Command` pattern is for specialists that
need to converse with the user directly across turns (ours don't; only the
Supervisor, via the Synthesizer, ever does). That's the concrete reason to
prefer it here, beyond just "it's simpler."

The real cost, worth naming since it wasn't obvious until we rendered the
compiled graph: RAG and Web don't show up as nodes in `.get_graph()` /
LangGraph Studio / a mermaid diagram — only `supervisor`, `tools`, and
`synthesizer` do. The 4-agent design lives in `graph.py`'s tool-wrapping
code, not in the graph's visual shape. If a graph diagram itself needs to
show four distinct agents (e.g. for something like a portfolio writeup),
that's the trigger to revisit this, not a sign something's wrong.

## Turn-by-turn flow

1. User sends a message in one of a Lore's `Chat`s (a Lore can have several,
   created/deleted independently of any Note — see [02-schema.md](02-schema.md)).
2. Next.js API loads that Chat's recent history, POSTs to the agent service
   (`POST /agents/turn`) with the Lore's id — no note or source content is
   preloaded; the Supervisor fetches whichever ones it needs via tools.
3. Agent service runs the graph; Supervisor routes, one or more specialists
   run, Supervisor finalizes a proposal (or, rarely, answers with no diff).
4. Agent service returns `{ message, proposal? }`. Next.js persists both as
   rows and returns them to the client.
5. UI renders the proposal as a diff with Accept/Reject. On Accept, Next.js
   applies the diff to the Note's content in a single transaction — or, if
   the proposal had no `note_id` (a brand new note, not an edit to an
   existing one), creates the Note with that content instead; on Reject,
   the proposal is marked rejected and nothing is written to any Note.

Note content is never created or mutated by anything other than this accept
step — the diff-review contract is a hard invariant, not just a UI
convention, and that includes bringing a new Note into existence, not just
editing one.

## Sources → text extraction pipeline

v1 does not embed sources or do vector retrieval — see "Why no embeddings"
below. Instead, a source's full text is extracted once at upload time and
stored directly on its `Source` row:

1. User uploads a file to a Lore (v1: PDF/txt/md — see
   [02-schema.md](02-schema.md) for the exact contract).
2. The Next.js API route (`POST /api/lores/:id/sources`) uploads the raw
   file to Supabase Storage, extracts its plain text in the same request
   (a synchronous library call — no LangGraph or Python involvement; there's
   nothing here that needs an LLM or a background job), and creates a
   `Source` row with both `storagePath` (the original file, kept so the UI
   can show/download it) and `content` (the extracted text) set, status
   `READY`. Extraction failure sets status `FAILED` instead.
3. At chat time, the Supervisor reads a source's `content` on demand — via
   a tool call back to Next.js (`GET /api/internal/sources/:id`, see
   [02-schema.md](02-schema.md#on-demand-notesource-tools)) — rather than
   Next.js including every source's full text in the `POST /agents/turn`
   request up front. No separate ingest call, no vector search either way.

### Why no embeddings

v1 deliberately skips embedding-based retrieval — no chunking, no embedding
provider, no similarity search. What it skips *to* has changed once already:
the original version of this decision was "context stuffing" (every `READY`
source's full text on every turn); it's now on-demand tool calls (the
Supervisor fetches a specific note or source's full text only when it
decides it's relevant — see "On-demand note/source tools" in
[02-schema.md](02-schema.md)). The reasoning for skipping embeddings holds
either way:

- **No provider needed beyond what's already paid for.** Anthropic doesn't
  offer an embeddings API (confirmed via their docs — they point to Voyage
  AI as a third-party option). Every embedding provider (Voyage, OpenAI,
  Google, Cohere) needs its own separate API key and billing account; this
  MVP already has a paid Anthropic key and nothing else, so adding a second
  paid API for a feature that isn't the point of the demo wasn't worth it.
- **Corpus size makes it unnecessary.** v1's target scale — a handful of
  articles/PDFs and notes per Lore, not a multi-thousand-page corpus (see
  "Hosting" below for the same assumption applied to ingestion duration) —
  means an exact fetch-by-id is enough to find the "relevant" text; nothing
  here needs similarity search to narrow down which document to look at.
- **Trade-off, made explicitly:** this doesn't scale to large source/note
  libraries (the whole point of real retrieval) — `list_notes`/`list_sources`
  return every id/title unfiltered, so a Lore with hundreds of notes would
  dump a long list into context just to let the model pick one. Revisit with
  real retrieval if a Lore's note/source count starts regularly exceeding
  what's reasonable to list in full.

This removes the `source_chunks` table, the `pgvector` extension, and the
Prisma-bypass data-ownership split that table used to require — Prisma now
owns every table without exception, and the agent service never talks to
Postgres directly. The on-demand tools don't change that: they call back
into Next.js's own API (`/api/internal/*`, gated on a shared secret rather
than a Supabase session — see [02-schema.md](02-schema.md)), which is the
only thing that ever touches Prisma.

## Repo layout

A single repo, two independently-built services, wired together by a root
`vercel.json`:

```
/lore
  vercel.json          # services + rewrites, see below
  /frontend             # Next.js app (pnpm)
    src/app/            # App Router
    src/components/
  /agents               # FastAPI + LangGraph agent service (uv)
    main.py              # entrypoint: `app` (FastAPI instance)
    pyproject.toml
  /docs
  CLAUDE.md
```

```json
// vercel.json
{
  "services": {
    "frontend": { "root": "frontend/" },
    "agents": { "root": "agents/", "entrypoint": "main:app" }
  },
  "rewrites": [
    { "source": "/agents/(.*)", "destination": { "service": "agents" } },
    { "source": "/(.*)", "destination": { "service": "frontend" } }
  ]
}
```

Requests to `/agents/*` (the contracts in
[02-schema.md](02-schema.md)) route to the FastAPI service; everything else
routes to Next.js. `vercel dev` runs both together locally. Locally outside
of `vercel dev`, run them separately: `pnpm dev` in `/frontend`
(port 3000) and `uv run uvicorn main:app --reload --port 8000` in `/agents`.

The agent service exposes `GET /health` and `POST /agents/turn` (see
[02-schema.md](02-schema.md) for the streaming contract), running the full
graph described above — Supervisor, the shared `ToolNode` (on-demand
note/source tools plus the `draft_with_rag`/`draft_with_web` delegation
tools, each wrapping its own nested tool-calling agent), and the Synthesizer.

## Hosting

Both the Next.js app and the Python agent service deploy to **Vercel**, as
one project, using [Vercel Services](https://vercel.com/docs/services) to
run the Python/FastAPI app (Vercel's Python runtime supports FastAPI
natively) alongside the Next.js frontend. No second hosting platform.

Why this holds at this project's scale: Vercel function duration is 300s
(5 min) on the free Hobby plan, up to 1800s (30 min) on paid plans. A chat
turn (a bounded, few-hop Supervisor loop) finishes in seconds. Extracting
text from an MVP-sized source (an article, a PDF, not a multi-thousand-page
corpus) — done synchronously inside the Next.js upload route, not the
Python service — comfortably finishes within the free tier's 5-minute
window too. All of this is just synchronous in-memory work inside one
request/response — nothing here needs a persistent background worker or a
second platform.

Revisit this only if one of these becomes true later: sources regularly
large enough to exceed the duration cap, a need for genuinely decoupled
background processing (a job queue, not tied to any request), or a need to
avoid cold-start latency with an always-warm process. None of those apply to
this MVP's scope.

## Frontend data layer conventions

All server data access from the browser goes through TanStack Query — never
raw `fetch` + `useState` in a component, and never `useQuery`/`useMutation`
defined inline inside a component body.

- Every query and every mutation lives in its own hook under
  `src/hooks/` (e.g. `use-lores.ts`, `use-create-lore.ts`), one file per hook.
  Once a domain (Lores, Notes, Sources, ...) grows enough hooks to be
  cluttered, group them into a subfolder (`src/hooks/lores/`) — don't
  preemptively nest for a single hook.
- The hook owns the data-layer concerns: the fetcher function, the
  `queryKey`/`mutationFn`, and cache reconciliation (`onMutate`/`onSuccess`/
  `onError` — see "Optimistic creates" below).
- The component only calls the hook. UI-only side effects that don't depend
  on the mutation actually resolving — resetting local form state — happen
  right after calling `mutate()`, not gated on a callback (see below for why).
  This keeps "did the write succeed" (hook) separate from "what should this
  screen do about it" (component).
- Hooks and components are function declarations (`export function
  useLores() {}`), matching the rest of the codebase — arrow functions are
  fine for short inline callbacks, not for the hook/component itself.

See [add-lore-modal.tsx](../frontend/src/components/dashboard/add-lore-modal.tsx)
and [use-create-lore.ts](../frontend/src/hooks/use-create-lore.ts) for the
reference shape.

### When to make a mutation optimistic

Optimistic updates are not the default for every mutation — they're a
deliberate trade of implementation complexity for perceived speed, and only
worth it when a mutation is:

- **Low-risk / high-confidence** — likely to succeed (writing to your own
  private data, not a third-party call that can plausibly reject).
- **Cheap to visually undo** — rolling it back (the row just disappears
  again) doesn't strand the user somewhere confusing.
- **Frequent enough that the round-trip delay is actually felt** — a rare
  action doesn't need this; a common one does.

It's the wrong default for payments, destructive actions, or anything where
"the user already mentally moved on, then it silently reverted" is
confusing rather than mildly surprising — for those, blocking-and-wait is
simpler to reason about and never shows the user something that isn't real
yet, at the cost of feeling slower. Judge each mutation against this before
reaching for the pattern below; don't apply it reflexively.

### Optimistic creates

Where the above criteria hold — Lore creation does — the UI updates
immediately on submit, not after the round-trip:

- **The client generates the id.** The hook's `mutate` wrapper calls
  `crypto.randomUUID()` and sends it as `id` in the request body; the API
  route validates it's a syntactically valid UUID and passes it explicitly
  to `prisma.<model>.create({ data: { id, ... } })`, overriding the schema's
  `@default(uuid())` (which only applies when `id` is omitted). This means
  the optimistically-rendered row and the server-confirmed row share one
  identity from the start — no temp-id-to-real-id swap needed once the real
  row lands. (This does *not* mean the row should be clickable while
  pending — see "Interactivity while pending" below; the stable id is about
  clean reconciliation, not an invitation to navigate early.)
- **`onMutate`**: cancel in-flight queries for the affected `queryKey`,
  snapshot the current cache value (for rollback), then `setQueryData` to
  insert the optimistic row. Return the snapshot as context.
- **`onSuccess`**: merge the server's response into the cache at the
  matching id (`setQueryData` mapping over the list), rather than
  `invalidateQueries` — the response is already the authoritative row, so
  refetching is redundant.
- **`onError`**: `setQueryData` back to the snapshot from `onMutate`
  (removes the optimistic row) and surface a toast (see below) explaining
  the write failed.
- The component calling `mutate()` doesn't wait for any of this — it applies
  its own UI-only side effects (closing a modal, resetting fields)
  synchronously right after the call, since the whole point is not blocking
  on the network. See [use-create-lore.ts](../frontend/src/hooks/use-create-lore.ts)
  and [add-lore-modal.tsx](../frontend/src/components/dashboard/add-lore-modal.tsx).

**Interactivity while pending.** `LoreSummary` carries an optional,
client-only `pending?: boolean` (see
[lore-card.tsx](../frontend/src/components/dashboard/lore-card.tsx)) that
`onMutate` sets on the optimistic row and that never comes from the API —
the `onSuccess` merge naturally drops it once the real row lands. While
`pending` is true, `LoreCard` renders **visibly pending and
non-interactive**: dashed border, dimmed (`opacity-70`), `pointer-events-none`,
a small spinner in place of the timestamp, "Creating…" in place of the
note/source counts. There's no Lore detail route yet, so "non-interactive"
is currently just a visual/aria (`aria-busy`) signal with nothing to click
into — but the `pointer-events-none` and the flag are already there so that
whenever a detail page makes `LoreCard` a link, that link must be gated on
`!pending` rather than defaulting to instant navigation via the id.
Reasoning: the client-generated id still buys clean `onSuccess`
reconciliation (merge by id, no invalidate) regardless — that part doesn't
change — but letting the user navigate into a detail page for a row that
might still fail server-side trades a few hundred milliseconds of
impatience for a real failure mode (arriving on a page for something that
turns out not to exist). That's a bad trade for how rarely creation
actually fails here.

### Keeping the hook and component in sync

Whichever way "When to make a mutation optimistic" (above) decides for a
given mutation, the hook and the component calling it must implement that
decision identically — never a mix:

- **Optimistic**: the hook writes to the cache in `onMutate`, *and* the
  component applies its own UI-only side effects (closing a modal,
  clearing a field) synchronously right after calling `mutate()`, without
  waiting on a callback. See
  [edit-lore-modal.tsx](../frontend/src/components/dashboard/edit-lore-modal.tsx)
  / [use-update-lore.ts](../frontend/src/hooks/use-update-lore.ts).
- **Blocking**: the hook does *not* touch the cache until `onSuccess`, and
  the component defers its UI change (closing a confirmation dialog,
  showing a "Deleting…" state) to a callback passed into `mutate()`. See
  [delete-lore-dialog.tsx](../frontend/src/components/dashboard/delete-lore-dialog.tsx)
  / [use-delete-lore.ts](../frontend/src/hooks/use-delete-lore.ts).

Mixing the two produces a visible inconsistency: an optimistic hook paired
with a component that still waits leaves the UI idle after the data has
already changed; a blocking component paired with an optimistic hook lets
the underlying data change while the UI still implies nothing has
happened — most damaging on destructive actions, where a row can vanish
from a list behind a confirmation dialog that's still open asking "are you
sure?". Pick the optimism model once per mutation, then verify both the
hook and the component agree on it.

### Notifications

[`sonner`](https://sonner.emilkowal.ski/) is the app's toast/notification
library — one `<Toaster />` mounted in
[providers.tsx](../frontend/src/app/providers.tsx), styled with the
`docs/04-design.md` tokens rather than its default theme. Used for
surfacing async failures that happen after the triggering UI (a modal, a
form) has already closed — most notably, optimistic mutation rollbacks.

## Assumptions made here (flag if wrong)

- **Auth: Supabase Auth.** Rationale: already using Supabase for Postgres;
  avoids standing up a separate auth provider for a single-tenant-per-user
  MVP.
- **Web agent search provider: Tavily**, via `langchain-tavily`'s
  `TavilySearch` tool — a common choice in the LangChain/LangGraph
  ecosystem, and the one already wired into the Web specialist.
