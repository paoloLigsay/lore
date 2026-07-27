# Business Context

## What Lore is

Lore is an AI-native notes app. Every note lives inside a "Lore" — a private
workspace with its own uploaded sources (files, links) and a chat agent that
helps write and edit the notes in that workspace, grounded in those sources.

Tagline: "Notes that know why." Positioning line: "Notes, grounded."

## The problem

Existing AI notes tools fall into two camps:

1. **Dumb notepads** — no intelligence, you're on your own.
2. **Chatbot-bolted-on notepads** — a generic chat window next to a document.
   It answers from general training knowledge, not from what the user actually
   collected. It agrees with whatever the user says. It overwrites text
   silently, so the user has to diff the before/after in their head.

Lore's bet: an AI notes tool is only trustworthy if (a) it answers from the
sources the user actually gave it, not a generic guess, and (b) every AI
change is visible and reversible before it lands — never a silent overwrite.

## Who it's for — three layers of the same product

Lore is meant to work at whichever layer the user wants, without forcing them
up a level:

1. **Just a notepad.** Familiar, web-based, no AI required. Write freely,
   nothing forced on you. This has to be genuinely good on its own — not a
   crippled shell around the AI features.
2. **A notepad with AI help.** Templates, a first draft of a section, a
   question answered, a spark to get unstuck. Same familiar notepad, just
   with a head start available when wanted.
3. **A notepad with a grounded advisor.** Feed it the sources and principles
   you're actually working from — stoic texts, business books, research
   papers — and it responds *through* that lens: a guide, a business analyst,
   a sounding board that argues from the material you gave it, not from
   generic training knowledge. This is the differentiated layer; 1 and 2 are
   the floor it has to earn trust before someone climbs to it.

## Why this is being built (real-world context)

This is a solo-built MVP intended primarily to demonstrate technical
capability to a future hiring manager — not to raise funding or acquire
users. That changes prioritization:

- **Depth and craft over feature breadth.** A smaller set of features built
  well (clean architecture, sane data model, working multi-agent loop)
  demonstrates more than a sprawling feature list built shallowly.
- **Demo-ability matters.** It should be deployable and walkable end-to-end
  (upload a source → chat → see a grounded, diffable proposal → accept it),
  not just individually-working pieces.
- **No deadline, but "shippable" is the bar.** Prefer finishing scope cleanly
  over leaving a wide scope half-done.

## MVP scope decision

v1 ships the full multi-agent system shown on the landing page: a Supervisor
agent (LangGraph) that fetches whichever notes/sources it needs and
delegates each request to whichever specialist fits —

- **RAG specialist** — retrieves from the Lore's uploaded sources (this is
  what makes layer 3 above real: answers grounded in the user's own
  material).
- **Web specialist** — live research when the uploaded sources fall short.

A Synthesizer always runs last — a mandatory final pass (not a specialist
the Supervisor picks between) that tightens tone/prose and writes the reply
the user actually sees, whether or not a specialist drafted a note change.
The Supervisor can also call a specialist again before finishing (e.g. to
try the other one) rather than settling for a poor fit. See
[01-architecture.md](01-architecture.md) for the concrete graph design.

## Non-goals for v1

- Multi-user collaboration / shared workspaces
- Billing or usage limits
- Mobile app
- Note version history / undo beyond the accept-reject proposal flow
