# Design System

Source of truth: `landing-page-draft-1.html`. These are the actual tokens
used there, extracted so the app UI (not just the landing page) stays
visually consistent. The landing page itself was built with inline styles /
a template tool, not Tailwind — the mapping below is for translating it into
the app's Tailwind config.

## Palette (oklch)

Warm neutral "paper" base with a configurable warm accent — not a stark
white/gray SaaS palette.

| Token | Value | Use |
|---|---|---|
| `bg` | `oklch(98.5% 0.006 80)` | Page background |
| `ink` | `oklch(20% 0.01 80)` | Primary text, primary buttons |
| `inkSoft` | `oklch(45% 0.012 80)` | Secondary text, nav links |
| `inkFaint` | `oklch(62% 0.01 80)` | Tertiary/meta text, footer |
| `borderColor` | `oklch(92% 0.006 80)` | Card borders, dividers |
| `sidebarBg` | `oklch(97.5% 0.006 80)` | Subtle panel backgrounds |
| `accent` | `oklch(80% 0.15 85)` | Default accent (amber/gold). Alternates: `oklch(78% 0.13 55)` (terracotta), `oklch(75% 0.12 200)` (blue) |
| `accentTint` | `oklch(95% 0.04 85)` | Accent background fill (badges, active nav item) |
| `accentDeep` | `oklch(45% 0.09 70)` | Accent text/icon color (needs contrast against `accentTint`) |

Semantic diff colors used for accept/reject review (not tied to the accent):

- Removed/rejected span: bg `#fdecea`, text `#9a4b45`
- Added/accepted span: bg `#e9f7ec`, text `#2e6b3e`

## Typography

Font stack: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif` — system font, no webfont load.

| Role | Size | Weight | Tracking | Line height |
|---|---|---|---|---|
| Hero H1 | 56px | 700 | -0.03em | 1.05 |
| Section H2 | 32–40px | 700 | -0.02em | 1.1 |
| Card H3/H4 | 17–20px | 700 | -0.01em | default |
| Body | 14.5–16px | 400–500 | normal | 1.6–1.75 |
| Label/eyebrow | 11–13px | 600–700 | 0.04–0.05em, uppercase | default |

## Shape & elevation

- Buttons and badges: fully pill-shaped (`border-radius: 100px`).
- Cards/panels: `14–18px` radius.
- Small inline elements (icon tiles): `8–10px` radius.
- Shadows are soft and low-opacity, offset downward, never a hard drop
  shadow: e.g. `0 30px 70px -30px rgba(0,0,0,0.18)` for hero-level elevation,
  `0 6px 18px -10px rgba(0,0,0,0.15)` for card-level elevation.
- Borders are hairline (`1px solid borderColor`) and do a lot of the
  separation work instead of shadows — most cards use border + a light
  shadow, not either alone.

## Layout

- Content max-width: `780px` (reading-width copy) to `1120px` (nav/footer,
  wide sections).
- Generous section padding: `90–120px` vertical between major sections.
- Three-column app shell shown in the product screenshot (sidebar 190px /
  content flexible / chat panel 240px) — use this as the reference layout
  for the actual Note editor view.

## Interaction

- Hover states are subtle: link underline + darken, or `opacity: 0.85` on
  filled buttons. No scale/transform hover effects.
- The accept/reject diff pattern (strikethrough red span → green replacement
  span, with Accept/Reject pill buttons below) is a core, reusable UI
  component — it's the visual proof of the "proposes, not overwrites"
  product principle from [03-business-context.md](03-business-context.md),
  not a one-off landing page illustration.

## Assumption flagged

The landing page doesn't confirm a component library. Recommend Tailwind
(already implied by the Next.js stack) with these tokens as CSS variables /
theme extension, plus shadcn/ui for base primitives (dialog, dropdown, etc.)
since it composes cleanly with custom Tailwind tokens rather than fighting
them. Override if you have a different preference.
