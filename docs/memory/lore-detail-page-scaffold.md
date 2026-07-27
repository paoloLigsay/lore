---
name: lore-detail-page-scaffold
description: The Lore detail page (/lore/[id]) — layout history, real Notes CRUD (create/list/select/rename), and a checklist of what's still stubbed (content saving, Sources, chat).
metadata:
  type: project
---

# Lore detail page — scaffold checklist

**Date:** 2026-07-22

## What happened

Built the first version of `/lore/[id]` — the 3-panel app shell described in
[04-design.md](../04-design.md) ("Three-column app shell... sidebar 190px /
content flexible / chat panel 240px") and shown in the product-preview
section of the landing page mockup. Deliberately scoped to UI-only for this
pass — explicit direction from the working session: get the shell in place
and visible, wire up real functionality later, and keep a checklist so nothing
gets forgotten.

## What's real right now

- Dashboard `LoreCard` is clickable (whole card is a stretched link to
  `/lore/:id`, gated on `!pending` per
  [mutation-optimism-contract.md](mutation-optimism-contract.md)'s
  "interactivity while pending" rule) and has a hover state (deepened
  shadow + border, no scale/transform — per 04-design.md's interaction
  rules).
- `/lore/[id]` is a real authed route (same auth-check pattern as
  `/dashboard`) that fetches the actual Lore via a new `useLore(id)` hook
  (`GET /api/lores/:id`, which already existed).
- The sidebar's "Lores" section lists real Lores via the existing
  `useLores()` hook and highlights the current one. It's ordered *after*
  "This Lore" — once you're inside a Lore, its own content is the primary
  nav; switching Lores entirely is secondary, closer to a workspace
  switcher.
- **One header, not two.** First pass had a page-level `Topbar` (logo +
  account) stacked above a second `LoreDetailHeader` (back + title) — user
  feedback called this out as redundant. Collapsed into one
  `LorePageHeader`: back arrow + Lore icon/title/meta on the left, account
  info on the right. The shared account block (email, avatar, sign-out) is
  now its own `AccountMenu` component
  ([layout/account-menu.tsx](../../frontend/src/components/layout/account-menu.tsx)),
  used by both this header and the dashboard's `Topbar` — extracted because
  it's identical markup/behavior in both places, not a speculative
  abstraction.
- **Panels are floating cards, not a flat edge-to-edge shell.** The
  literal reference layout in [04-design.md](../04-design.md) and the
  landing-page mockup uses hairline borders between columns
  (Notion/VSCode-style split panes). User feedback preferred the
  dashboard's card language instead — each panel is now its own
  `rounded-lg border bg-card shadow-[...]` surface with a gap between
  them, matching how `LoreCard` looks on `/dashboard`. This is a
  deliberate divergence from 04-design.md's literal 3-column spec, in
  favor of visual consistency with the rest of the built app.
- **Heading dropdown in the note editor toolbar.** Replaced the single H2
  button with a `Paragraph / Heading 1–6` dropdown, built on
  `@base-ui/react/select` (already a dependency, same primitive family as
  the existing `Modal`/`Button` wrappers) — see
  [ui/select.tsx](../../frontend/src/components/ui/select.tsx). Applies
  `document.execCommand('formatBlock', ...)`, same no-persistence
  constraint as the rest of the editor.
- **Minimal scrollbar utility.** `.scrollbar-minimal` in `globals.css` —
  thin light-gray thumb (`--border` token), transparent track, scroll
  buttons/arrows hidden. Applied to the three internally-scrolling regions
  on this page (sidebar, editor body, chat message area). Not applied
  site-wide yet since it was requested in the context of this page.

## What's still a stub (by design, this pass)

- **Left sidebar — "Sources" row**: placeholder labeled "Soon". No
  `GET /api/lores/:id/sources` route exists yet, so there's nothing real
  to list. (Notes became real in the third round below.)
- **Center panel — note editor**: a `contentEditable` WYSIWYG (bold/italic/
  heading levels/bulleted list via `execCommand`, chosen to avoid pulling
  in a rich-text library). Typing edits are still local-only — nothing
  saves as you type (see third round below for what *does* persist now:
  a note's initial content at creation time).
- **Right panel — chat**: fully disabled (input + send button both
  `disabled`). No `ChatMessage`/`Proposal` persistence, no call to the
  agent service — `POST /agents/turn` doesn't exist server-side yet either
  (backend only exposes `GET /health`, per
  [01-architecture.md](../01-architecture.md)).

## Second round of feedback (same day)

After the first pass landed, user feedback drove another revision:

- **Account menu collapsed to just the avatar.** The always-visible
  "email + avatar + sign out" row felt heavy for a header. `AccountMenu`
  ([layout/account-menu.tsx](../../frontend/src/components/layout/account-menu.tsx))
  is now just the initials circle; clicking it opens a `@base-ui/react/popover`
  showing the full email and a "Sign out" row. `SignOutButton` was
  simplified to a plain full-width menu-item button (its only remaining
  consumer is this popover, so the old icon-button `Button` wrapper was
  dropped rather than kept as a second variant).
- **Reversed the "floating card" panel treatment from round one.** User
  preferred full-bleed panels: no rounded corners, no padding/gaps between
  them — closer to 04-design.md's original flat 3-column reference layout
  than the card style from the first pass, but now resizable (see next
  point). `LoreSidebar`/`NoteEditor`/`LoreChatPanel` lost their individual
  `rounded-lg border shadow` treatment; the visual separation between
  panels is now just the drag handle itself.
- **Panels are resizable with min-widths**, via
  [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)
  (new dependency — added because hand-rolling drag-resize with
  accessible keyboard support and min/max clamping is a lot of fragile
  code for something a small, well-maintained library already solves; it's
  also what shadcn's own "resizable" primitive wraps, so it fits this
  stack's existing conventions). Note: the installed version (4.x) uses a
  different API than older versions floating around in docs/tutorials —
  `Group`/`Panel`/`Separator`, not `PanelGroup`/`Panel`/`PanelResizeHandle`.
  Verified against `node_modules/react-resizable-panels/dist/react-resizable-panels.d.ts`
  directly rather than assumed. Current widths: sidebar 220–420px (default
  272), editor 420px min (no max), chat 260–440px (default 320).
- **Responsive collapse below the `lg` breakpoint (1024px).** Chosen
  because it's roughly where the three panels' combined min-widths stop
  fitting comfortably. Below it: sidebar and chat are hidden entirely, the
  note editor takes the full width, and a menu-icon button in the header
  opens the sidebar as a slide-in drawer
  ([lore-mobile-sidebar.tsx](../../frontend/src/components/lore/lore-mobile-sidebar.tsx),
  built directly on `@base-ui/react/dialog` rather than reusing the
  centered `Modal` wrapper with overridden positioning classes — cleaner
  than fighting `tailwind-merge` over conflicting transform/position
  utilities). Chat has no reopen affordance on small screens, matching
  that it's disabled anyway.
- **Bug caught during visual verification**: on the mobile fallback,
  `NoteEditor` didn't fill the available width — it only had a real width
  before because `Panel` (from react-resizable-panels) was constraining
  it; the plain mobile flex row had nothing sizing it. Fixed by adding
  `w-full flex-1` to `NoteEditor`'s root so it stretches in either
  context.

## Third round: real Notes (create + list + select), "+" menu

User asked for two things: a "+" affordance to add notes/sources to a
Lore (with create-from-scratch / import-a-note / import-a-source options),
and considered empty-state UX — auto-select the first note on load, a
"no notes yet" state when the Lore has none, and a distinct "please select
a document" state for when notes exist but nothing is selected. This
pushed Notes from a "Soon" placeholder to a real, working feature:

- **`Note` list + create are real**: `GET/POST /api/lores/:id/notes`
  ([route.ts](../../frontend/src/app/api/lores/[id]/notes/route.ts)),
  mirroring the Lore CRUD auth/ownership-check pattern exactly (unlike the
  buggy `GET /api/lores` noted below, this route *does* check
  `lore.userId !== user.id`). Hooks: `use-notes.ts` (list),
  `use-create-note.ts` (optimistic create, same pattern as
  `use-create-lore.ts` — client-generates the id via
  `crypto.randomUUID()`, and its wrapped `mutate()` returns that id
  synchronously so the caller can select the new note immediately without
  waiting on the round-trip). `GET/PATCH /api/notes/:id` (single-note
  fetch and content save) are **not** built yet — see checklist.
- **The note count on the header can go stale.** `useLore`'s cached Lore
  object carries `_count.notes`, which a note creation doesn't naturally
  update. Fixed by having `useCreateNote`'s `onMutate` also bump
  `_count.notes` on both the `["lores", loreId]` and `["lores"]` cache
  entries (mirrored on rollback in `onError`) — otherwise the header would
  read "0 notes" right after creating the first one until a full refetch.
- **The "+" menu** ([add-content-menu.tsx](../../frontend/src/components/lore/add-content-menu.tsx))
  is a `@base-ui/react/menu` with three items, two real and one
  intentionally not: "Create a note from scratch" (title "Untitled", empty
  content, selected immediately), "Import a note" (a hidden `<input
  type=file accept=".md,.txt">`, read client-side via `file.text()` — no
  Supabase Storage involved, the whole file becomes the Note's `content`
  directly), and "Import a source" (`toast.info(...)` explaining sources
  need file storage + the ingestion pipeline, neither of which exist yet —
  consistent with the "Soon" labels elsewhere rather than faking an upload
  flow with nowhere real to go).
- **Security invariant on imported/rendered note content — read before
  touching this again.** `NoteEditor` loads a note's content into the DOM
  via `editorRef.current.innerHTML = note.content` (see
  [note-editor.tsx](../../frontend/src/components/lore/note-editor.tsx)).
  That's only safe because *every* current write path produces content
  that was never blind-concatenated from untrusted input:
  1. Local typing goes through the browser's own `execCommand`, which
     can't inject arbitrary markup.
  2. Imported file text goes through `textToNoteHtml()` in
     `add-content-menu.tsx`, which escapes `&`/`<`/`>` on every paragraph
     *before* wrapping it in `<p>` tags — verified by importing a `.txt`
     containing a literal `<script>alert(1)</script>` and confirming it
     rendered as visible escaped text, not an executed script.

  **If a future write path ever stores content this app didn't itself
  generate safely — an AI/agent proposal, a pasted-in source, anything
  not run through an equivalent escape step — sanitize it (e.g.
  DOMPurify) before it can reach `innerHTML`.** This is exactly where the
  accept/reject `Proposal` flow will eventually write content, so whoever
  builds that needs to either sanitize at that boundary or move off
  storing raw HTML entirely (e.g. markdown + a safe renderer, which is
  also what `Note.content`'s schema comment already claims it is — see
  the "Known inconsistency" note in the checklist below).
- **Empty-state UX, computed at render time, not via effect.** `NotePanel`
  ([note-panel.tsx](../../frontend/src/components/lore/note-panel.tsx))
  branches on: notes loading → skeleton; notes fetch failed → distinct
  error state (not conflated with "no notes" — an early version of this
  did conflate them, since `useNotes`'s `isError` wasn't threaded through
  at first); zero notes → "No notes yet" + a "New note" CTA; notes exist
  but none resolve → "Please select a document". The "auto-select the
  first note" behavior is **not** a `useEffect` + `setState` — it's a
  derived value computed directly in `LoreDetailView`'s render:
  `effectiveSelectedNoteId = notes.find(matches selectedNoteId)?.id ?? notes[0]?.id ?? null`.
  An effect-based version of this was actually written first and caught
  by `eslint-plugin-react-hooks`'s `set-state-in-effect` rule (adjusting
  state to match a prop/query result is exactly the "you might not need
  an effect" case) — worth remembering next time a "default the selection
  to X" pattern comes up anywhere else in this app.

## Fourth round: note rename (two entry points)

User asked for note renaming two ways: (a) right-click a note in the
sidebar → context menu → "Rename" → the row becomes a text input, and (b)
double-click the title in the document panel → same in-place input
treatment. Both needed to land on the same PATCH.

- **`PATCH /api/notes/:id`** ([route.ts](../../frontend/src/app/api/notes/[id]/route.ts))
  — title only, scoped to exactly what was asked (content-saving is still
  a separate, larger checklist item below). Ownership check goes through
  `note.lore.userId`, since a Note has no direct `userId` of its own —
  mirrors the auth pattern of every other route here, not the buggy one.
  `use-update-note.ts` is optimistic, same shape as `use-update-lore.ts`.
- **One shared `InlineRenameInput`** ([inline-rename-input.tsx](../../frontend/src/components/lore/inline-rename-input.tsx))
  powers both entry points rather than duplicating the edit-state
  handling twice. It auto-selects all text on focus, commits on
  Enter/blur, cancels on Escape (discarding the draft), and — this part
  actually got caught by manual testing, not a linter — guards against
  **double-commit**: pressing Enter blurs the input as a side effect,
  which would otherwise fire the commit callback a second time. Guarded
  with a `useRef` "already resolved" flag rather than trying to
  distinguish the two events by type.
- The sidebar entry point uses `@base-ui/react/context-menu`
  (`ContextMenu.Root`/`Trigger`/`Popup`/`Item` — same styling conventions
  already verified for `Menu` and `Select`, since `ContextMenu` re-exports
  the same popup/item parts under the hood). The `Trigger` wraps the note
  row in a `div`; given `display: contents` on that wrapper, it doesn't
  affect the existing flex layout.
- **Follow-up fix: entering rename mode caused a visible layout jump.**
  User caught this after the fact — an `<input>` has different intrinsic
  box metrics (border, padding, line-height) than the `<h2>`/`<button>`
  text it replaces, so swapping between them shifted surrounding content
  by a few pixels. Fixed two ways in `InlineRenameInput`: (1) it no longer
  sets its own `border`/padding — those add to an element's rendered
  height even at `padding: 0`-adjacent values, so any mismatch with the
  display element shows up as a jump. It uses `ring` (box-shadow) instead
  for the "you're editing" affordance, since box-shadow paints without
  taking layout space. (2) both call sites now wrap *both* the text and
  input states in one fixed-height container (`h-5` for the document
  title, `h-8` for sidebar rows) with `items-center`, so the swap can't
  change the row's height regardless of any remaining metric differences
  between the two element types. Verified with actual bounding-box
  measurements before/after triggering edit mode (0px delta in both
  places), not just a visual screenshot check — worth doing the same for
  any future "swap text for an inline input" UI in this app.

## Checklist for wiring this up for real

- [x] ~~`Note` CRUD: `GET/POST /api/lores/:id/notes`~~ — done (round 3).
- [x] ~~Note rename~~ — done (round 4, `PATCH /api/notes/:id`, title only).
- [ ] `GET /api/notes/:id` — still not built (not currently needed, the
      list already carries full content) and, more importantly, **saving
      content edits** made in the editor after the initial create. Right
      now only a note's *creation-time* content persists (plus its
      title, as of round 4) — typing in the body after that is still
      local-only.
- [ ] Swap the editor's `contentEditable`/`execCommand` approach for
      something that can round-trip through `Note.content`'s schema
      comment ("markdown, current accepted state" — 02-schema.md). Right
      now it stores/renders HTML, not markdown; this mismatch predates
      this round but is now load-bearing (real notes persist real HTML).
      Needs a decision: store markdown and convert, or update the schema
      comment to reflect that content is HTML.
- [ ] Per CLAUDE.md's accept/reject guardrail: once note-content saving
      exists, only the user's own edits go through that direct save path
      — AI-authored changes still must go through `Proposal`, never write
      `content` directly.
- [ ] `Source` read path: `GET /api/lores/:id/sources` (upload itself is a
      separate, larger feature — Supabase Storage + the ingest pipeline in
      01-architecture.md).
- [ ] Chat: `POST /api/notes/:id/chat` per the contract in
      [02-schema.md](../02-schema.md), which depends on the agent service's
      `POST /agents/turn` existing first (Supervisor graph — not started).
- [ ] Proposal accept/reject UI in the chat panel, wired to
      `/api/proposals/:id/accept` and `/reject`.

## Why this matters here

Business context ([03-business-context.md](../03-business-context.md)) calls
out "demo-ability" and "shippable > wide-and-half-done" as the bar for this
MVP. Landing the shell now, with an explicit checklist instead of scattered
TODOs, keeps the half-built state legible instead of silently incomplete —
the guardrail in CLAUDE.md this is deliberately *not* violating is "no
half-finished implementations," since every stub here is visibly labeled
("Soon", disabled inputs) rather than pretending to work.

## Also found (not fixed, out of scope for this pass)

While testing this page, `GET /api/lores` (`frontend/src/app/api/lores/route.ts`)
was found to have **no auth check** — unlike its `POST` handler and unlike
every handler in `/api/lores/[id]/route.ts`. It returns *all* Lores for
*all* users to any caller, authenticated or not. Confirmed by hitting a
protected page while logged out and seeing a real Lore title render in the
sidebar. This is a pre-existing bug, not introduced by this change — flagged
here so it doesn't get lost, but deliberately not silently fixed alongside
an unrelated UI task.
