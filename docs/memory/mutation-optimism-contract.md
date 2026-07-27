# Mutation optimism/blocking contract mismatch

**Date:** 2026-07-22
**Rule lives in:** [docs/01-architecture.md](../01-architecture.md#keeping-the-hook-and-component-in-sync)

## What happened

While adding update/delete to the dashboard Lore cards:

- `EditLoreModal` called `mutation.mutate()` and only closed the modal
  inside `onSuccess` — but `useUpdateLore` already wrote to the query
  cache in `onMutate` (correctly optimistic, per the "When to make a
  mutation optimistic" criteria in the architecture doc — edit is
  low-risk, cheap to undo, frequent). The modal was waiting on a round
  trip the data layer had already made irrelevant: the row behind it had
  already updated.
- `useDeleteLore` initially had the opposite problem: it wrote an
  optimistic removal in `onMutate`, even though delete is a destructive
  action the architecture doc explicitly calls out as the wrong case for
  optimism. `DeleteLoreDialog` was already blocking correctly (closes only
  in `onSuccess`, would show a "Deleting…" state) — but the row was
  vanishing from the grid *behind* the still-open confirmation dialog,
  before the user's "are you sure?" had even resolved.

## The rule

A mutation's hook and the component calling it must implement the *same*
optimism model — never a mix. Full contract in
[docs/01-architecture.md](../01-architecture.md#keeping-the-hook-and-component-in-sync).

## Why this matters here

Lore's core trust pitch is "every AI change is visible and reversible
before it lands" (see
[03-business-context.md](../03-business-context.md)). A UI that shows
stale state, or reveals a destructive change before confirmation,
undermines that same principle in ordinary CRUD — not just the AI
proposal flow it was designed for.

## How to apply

Before wiring a new mutation's hook to its component, decide the
optimism model once (using the existing criteria in
`01-architecture.md`), then verify both sides implement it: does the
hook's `onMutate` write to the cache, and does the component close/reset
synchronously right after calling `mutate()`? Or does the hook wait for
`onSuccess`, and does the component gate its UI change on that same
callback? If the answer to "which model" differs between hook and
component, that's the bug.
