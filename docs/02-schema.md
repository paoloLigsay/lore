# Schema & API Contracts

## Entities (Prisma / Postgres)

```prisma
model User {
  id        String   @id @default(uuid()) // mirrors Supabase auth.users.id
  email     String   @unique
  createdAt DateTime @default(now())

  lores Lore[]
}

model Lore {
  id          String   @id @default(uuid())
  userId      String
  title       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user    User     @relation(fields: [userId], references: [id])
  notes   Note[]
  sources Source[]
  chats   Chat[]
}

model Note {
  id        String   @id @default(uuid())
  loreId    String
  title     String
  content   String   // markdown, current accepted state
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lore      Lore       @relation(fields: [loreId], references: [id])
  proposals Proposal[]
}

model Source {
  id          String       @id @default(uuid())
  loreId      String
  type        SourceType
  title       String
  url         String?      // for type = LINK (not in v1 — files only)
  storagePath String?      // for type = FILE, path in Supabase Storage
  fileExt     String?      // for type = FILE, original extension (e.g. "pdf"), for UI display
  content     String?      // extracted plain text, included directly in agent
                            // prompts — v1 has no embeddings/retrieval, see
                            // "Why no embeddings" in 01-architecture.md
  status      SourceStatus @default(PROCESSING)
  createdAt   DateTime     @default(now())

  lore Lore @relation(fields: [loreId], references: [id])
}

enum SourceType {
  FILE
  LINK
}

enum SourceStatus {
  PROCESSING
  READY
  FAILED
}

model Chat {
  id        String   @id @default(uuid())
  loreId    String
  title     String?  // auto-filled from the first message, see below
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lore     Lore          @relation(fields: [loreId], references: [id])
  messages ChatMessage[]
}

model ChatMessage {
  id        String   @id @default(uuid())
  chatId    String
  role      MessageRole
  content   String
  createdAt DateTime @default(now())

  chat Chat @relation(fields: [chatId], references: [id])
}

enum MessageRole {
  USER
  ASSISTANT
}

model Proposal {
  id            String   @id @default(uuid())
  noteId        String? // null while proposing a brand new note — see noteTitle
  noteTitle     String? // the new note's title; set only when noteId is null
  chatMessageId String
  agent         AgentType // which drafting specialist produced this (RAG or WEB) —
                          // the Synthesizer always runs after, but isn't a distinct
                          // AgentType: it's a mandatory final pass, not a selectable
                          // specialist, see 01-architecture.md
  diffBefore    String
  diffAfter     String
  explanation   String
  status        ProposalStatus @default(PENDING)
  createdAt     DateTime @default(now())

  note Note? @relation(fields: [noteId], references: [id])
}

enum AgentType {
  RAG
  WEB
}

enum ProposalStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

## Next.js API surface

| Route | Method | Purpose |
|---|---|---|
| `/api/lores` | GET, POST | List / create Lores for the current user |
| `/api/lores/:id` | GET, PATCH, DELETE | Read / rename / delete a Lore |
| `/api/lores/:id/notes` | GET, POST | List / create Notes in a Lore |
| `/api/notes/:id` | GET, PATCH, DELETE | Read / rename or edit content / delete a Note (cascades to its `ChatMessage`s and `Proposal`s) |
| `/api/lores/:id/sources` | GET, POST | List sources / upload a file (`multipart/form-data`) — uploads to Supabase Storage and extracts text synchronously, see [01-architecture.md](01-architecture.md) |
| `/api/sources/:id` | PATCH, DELETE | Rename a source / remove it (row + its Storage object) |
| `/api/lores/:id/chats` | GET, POST | List a Lore's Chats / create a new one (title starts `null`) |
| `/api/chats/:id` | DELETE | Delete a Chat (cascades its `ChatMessage`s) |
| `/api/chats/:id/messages` | GET, POST | List a Chat's message history / send a message — proxies to agent service as a stream, persists `ChatMessage` (+ a `Proposal` row when the agent service returns one), and sets the Chat's `title` from the first message if still `null` |
| `/api/proposals/:id/accept` | POST | Apply `diffAfter` to the Note's content (or create the Note, if this proposed a new one), mark `ACCEPTED` |
| `/api/proposals/:id/reject` | POST | Mark `REJECTED`, Note untouched |

Internal-only, not for the browser — gated on a shared secret instead of a
Supabase session (see "On-demand note/source tools" below):

| Route | Method | Purpose |
|---|---|---|
| `/api/internal/lores/:id/notes` | GET | List a Lore's notes — `id`/`title` only, no content |
| `/api/internal/notes/:id?loreId=` | GET | One note's full content, scoped to `loreId` |
| `/api/internal/lores/:id/sources` | GET | List a Lore's `READY` sources — `id`/`title` only, no content |
| `/api/internal/sources/:id?loreId=` | GET | One source's full content, scoped to `loreId` |

## Agent service contract (Python/FastAPI)

**`POST /agents/turn`** — streams a Server-Sent Events response (not a single
JSON body — the chat panel needs the reply to render token-by-token, not
appear all at once).

```json
// request
{
  "lore_id": "uuid",
  "chat_history": [{ "role": "user" | "assistant", "content": "..." }],
  "user_message": "string"
}
```

No note or source content is preloaded — a `Chat` isn't owned by any one
Note, so every note and every uploaded source in the Lore is available to
the Supervisor only on demand, via tool calls back into Next.js
(`list_notes`, `get_note`, `list_sources`, `get_source` — see "On-demand
note/source tools" below). This replaced an earlier version of this contract
that included the currently-open note's content (and, before that, every
`READY` source's full text) on every turn — see the note on this in
[01-architecture.md](01-architecture.md#sources--text-extraction-pipeline).

```
// response: text/event-stream — zero or more "status" events, then one
// "token" event per text chunk, then one final "result" event

event: status
data: {"label": "Reading your message..."}

event: status
data: {"label": "Searching the web..."}

event: status
data: {"label": "Checking your notes..."}

event: status
data: {"label": "Drafting the change..."}

event: status
data: {"label": "Reviewing what it found..."}

event: status
data: {"label": "Polishing the reply..."}

event: token
data: {"text": "chunk of the reply"}

event: token
data: {"text": " ..."}

event: result
data: {"message": "full assistant reply text", "proposal": null}
```

`status` events are UI-only progress labels for whatever the graph is doing
before the reply starts streaming. They come from two levels, both in
[graph.py](../agents/graph.py) / [main.py](../agents/main.py):

- The Supervisor's own next move, read the instant its node finishes (via
  LangGraph's `"updates"` stream mode) — `"Reading your message..."`
  (turn start), `"Searching your Lore..."` / `"Searching the web..."`
  (delegating to `draft_with_rag`/`draft_with_web`), `"Checking your
  notes..."` (any other tool call), `"Reviewing what it found..."` (a tool
  just returned, re-evaluating), `"Polishing the reply..."` (done, handing
  off to the Synthesizer).
- Once delegated, the RAG/Web specialist's *own* tool calls, pushed from
  inside `_run_specialist` via `get_stream_writer()` (LangGraph's
  `"custom"` stream mode) as it works — `"Reading through your notes..."`,
  `"Checking your sources..."`, `"Searching the web..."`, `"Drafting the
  change..."`. Without this a delegated call would otherwise read as one
  long silent wait behind a single label, since it runs as one opaque tool
  call from the Supervisor's point of view.

Either way, a label is only ever sent once its cause has already happened
(the node/step finished) but *before* the next, slower step it describes
runs — so it's always on the wire ahead of the wait it's explaining, not
trailing it. Events are deduped: an unchanged label is never repeated.
They're transient: never persisted to `ChatMessage`, and superseded by the
first `token` event. Both `/api/chats/:id/messages` and the chat panel just
pass them through/ignore them like any other event they don't specifically
handle — see "thin proxy" below.

`proposal` is `{ agent, note_id, note_title, diff_before, diff_after, explanation }`
when the Supervisor delegated to `draft_with_rag`/`draft_with_web` this turn
— `null` (the whole object) when no specialist was called. `note_id` (which
`draft_with_rag`/`draft_with_web` resolve internally via `get_note`, since
the diff needs the note's exact current text) is how Next.js knows which
`Note` the resulting `Proposal` row belongs to — except when the specialist
proposed a brand new note instead of editing one that already exists, in
which case `note_id` is `null` and `note_title` carries the new note's title
instead; Next.js creates the `Note` row (rather than updating one) on
accept, see [01-architecture.md](01-architecture.md).

`POST /api/chats/:id/messages` (Next.js) is a thin proxy over this: it
persists the user's `ChatMessage` before calling the agent service (setting
the Chat's `title` from that message if it's the first one), streams the
SSE response straight through to the browser unmodified, and — once the
stream ends — persists the assistant's `ChatMessage` (and a `Proposal` row,
once `proposal` is non-null) from the accumulated `result` event. The
browser therefore speaks the same SSE contract as the agent service;
Next.js doesn't re-shape it.

There is no `/agents/ingest` endpoint — text extraction happens synchronously
in the Next.js upload route (see [01-architecture.md](01-architecture.md)),
not in the agent service.

### On-demand note/source tools

The Supervisor has four tools bound to it, scoped to the turn's `lore_id`:

- `list_notes()` — every note in the Lore, `{id, title}` only
- `get_note(note_id)` — one note's full `{id, title, content}`
- `list_sources()` — every `READY` source in the Lore, `{id, title}` only
- `get_source(source_id)` — one source's full `{id, title, content}`

Each calls the matching `/api/internal/*` route above. `lore_id` is bound
into the tool closures server-side from the trusted `/agents/turn` request
payload — the model can never supply it — and the internal routes
independently re-check that the requested note/source actually belongs to
that `loreId` before returning content, 404ing otherwise. This closes the
obvious risk: without it, a prompt injected into note/source content could
try to make the model fetch a note or source id from a *different* Lore, and
the shared secret alone (see below) wouldn't stop that, since it only proves
"this is our own agent service," not "for this user's own data."

**Auth for `/api/internal/*`**: these routes never see a Supabase session
(the caller is the agent service, not a browser), so they're gated on a
shared secret instead — the agent service sends `X-Internal-Key`, checked
against `AGENT_SERVICE_INTERNAL_KEY` (same value in both services' `.env`;
see `frontend/src/lib/internal-auth.ts`). This is separate from, and doesn't
replace, the `loreId` scoping above.
