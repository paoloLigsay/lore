# Project Memory

A running log of decisions, corrections, and lessons that came out of
working sessions on this codebase — the "why we do it this way" that
isn't obvious from reading the code or the architecture docs alone.

This is **project memory**: checked into git, part of the repo, scoped
entirely to Lore. It is distinct from:

- **The docs** (`docs/01-architecture.md`, `docs/02-schema.md`, etc.) —
  those state the *current* convention. This folder records how a
  convention was arrived at, including the mistake or discussion that led
  to it. When a memory entry produces a durable rule, that rule belongs in
  the relevant doc too — the memory entry then links to it rather than
  duplicating it.
- **Claude's global `~/.claude/CLAUDE.md`** — cross-project preferences
  for how Claude should work with this user generally, not anything
  specific to Lore.
- **Claude's own internal auto-memory** (outside this repo, not
  git-tracked) — this folder is the one that matters for Lore; entries
  here should be treated as the durable record, not that one.

When a working session surfaces a reusable lesson — a bug pattern worth
naming, a decision with a non-obvious rationale, a correction to how work
should be approached in this repo — it gets written here as its own file
and indexed below.

## Entries

- [mutation-optimism-contract.md](mutation-optimism-contract.md) — a
  mutation's hook and the component calling it must agree on optimistic
  vs. blocking; mixing the two produces visible UI/data inconsistencies.
- [lore-detail-page-scaffold.md](lore-detail-page-scaffold.md) — `/lore/[id]`:
  Lore nav, Notes (create/list/select/rename, real), a "+" add-content
  menu, disabled chat. Checklist of what's left (note content saving,
  Sources, chat), a security invariant on how note HTML content must stay
  safe to `innerHTML`, and an unrelated auth bug found along the way.
