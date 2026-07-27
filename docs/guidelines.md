## The Speed Win (And Why It Matters Less Than You'd Think)

Building an MVP used to take weeks. Design, architecture, hunting bugs through late night sessions. Now? Tasks that took 4 hours take 1 hour or less.

That's real. And it matters. But speed alone isn't the story.

The story is what happened after we got fast.

## The Hidden Cost

When code arrives ready-to-use, you stop reading it the way you used to.

You stop tracing through the logic. You don't live inside the function—you spot-check it. You trust it more than you should because it *looks* right. And that's where things break.

We learned this the hard way.

### The Defensive Try-Catch Trap

Early on, we built a feature and shipped it. The code worked. Then it didn't.

AI had wrapped everything defensively—try-catch blocks everywhere, silently returning empty arrays or zero when things went wrong. When a field was missing, the code didn't fail. It hid the failure.

```jsx
// What AI gave us (bad)
function calculateTotal(items) {
  try {
    return items.reduce((sum, item) => sum + item.price, 0);
  } catch (e) {
    return 0; // Oops. This hides the real problem.
  }
}
```

We caught it in code review. But here's the thing—it's insidious enough that without the pattern, it slips through. We've seen it reach production. The bug doesn't crash. It silently returns wrong numbers. Tracing backward through the code, trying to understand why calculations were off, is harder than the original build.

The real fix wasn't the code. It was context.

```jsx
// What we ask for now (good)
function calculateTotal(items) {
  // No try-catch. If this fails, it *should* fail.
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Catch at the boundary where it matters
app.post('/checkout', async (req, res) => {
  try {
    const total = calculateTotal(req.body.items);
    await db.saveOrder(total);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```

We added one rule to our context: **Catch errors only at system boundaries. Let them propagate otherwise.**

After that, AI stopped being defensive. Bugs surfaced where they should—loudly, where we could actually fix them.

## What Stops AI From Over-Complicating

AI loves to add layers. A one-liner becomes a helper function. A simple operation gets comments, error handling, type guards. It plays safe.

We've hit this on design too. Building an AI-powered slide deck tool, we kept getting generic, flat interfaces—what people call "AI slop." Stock patterns, no character.

The fix wasn't asking for better design. It was being specific.

We added a `design.md` to our context. Tailwind config references. Design system rules. Even reference images—AI can analyze them. Suddenly, the designs had personality. They matched what we actually built.

The pattern is the same: **better context, not better prompts.**

## How We Actually Set This Up

This doesn't work with lazy prompts. You need real infrastructure.

We have a `/docs` folder in every project root:

```
/docs
  01-architecture.md      (system design, data flow, decision rationale)
  02-schema.md            (database schema, API shapes, data contracts)
  03-business-context.md  (what problem we're solving, user needs, constraints)
  04-design.md            (design system, Tailwind config, UI patterns, brand guidelines)
  /memory/                (optional—important changes, fixes, instructions)
    date-memory.md
```

We have two `CLAUDE.md` files:

**Global CLAUDE.md** - Fixed tech instructions that apply everywhere:

- Error handling rules (catch at boundaries)
- Code quality standards (descriptive names, no over-engineering)
- Anti-patterns (no obvious comments, no lazy naming like `_v2`)
- Workflow rules (don't commit unless asked, verify before assuming APIs exist)

**Project CLAUDE.md** - Context-specific:

- What we're building and why
- Tech stack and architecture decisions
- References to `/docs` files
- Project-specific guardrails

When we use AI, all of this context loads first. The AI isn't guessing about our environment—it knows it.

## The Token Reality

Building MVPs with AI is also building token-heavy apps. At scale, context matters.

We hit token capacity regularly. That's when `/compact` saves us. The trade-off is real: you lose your conversation thread. If you're still exploring, that sucks — you need to reference what you've tried. But once you've locked in a decision and you don't need that exploration anymore. `/compact` clears it away, frees up tokens, and you move forward with just what matters.

We also learned to pick the right model. Complex architectural decisions? Use a stronger model. Quick fixes? Cheaper models work fine.

The setup time pays off because you're not starting from zero every conversation. Your context is baked in.

## The Honest Tradeoff

Here's what we actually lost:

You don't understand certain systems deeply anymore. You don't trace through logic yourself. You review instead of explore. If something breaks, debugging is slower because you haven't lived inside it.

There's also a new kind of laziness: saying "let AI handle it" without thinking about whether it's the right approach. That's a real risk.

The win is equally real: we're thinking about systems instead of syntax. We're asking "does this solve the problem?" instead of hunting semicolons. We're shipping MVPs faster and learning what users actually want before over-building.

## What Changed

The shift isn't from coding to not-coding. It's from **coding by default to thinking first.**

Before: Task arrives → I write → I debug → done.

Now: Task arrives → I think about the problem → I shape the approach → AI helps execute → I review for fit.

That second version moves slower at the start. It moves faster overall.

The setup takes time. One-time cost. But it compounds — every new feature, every new project, you're not starting from zero. You're building on guardrails you've already defined. And that's worth the initial investment.