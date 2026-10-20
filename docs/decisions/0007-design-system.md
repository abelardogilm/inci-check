# 7. Design system: Tailwind CSS, tokens grounded in the ingredient-label domain

## Status

Accepted

## Context

The UI so far (admin and app) was unstyled browser-default HTML — functional, but with no visual identity. Before adding more screens, it's worth settling on a styling approach and a small token system, rather than hand-rolling CSS per page or picking colors ad hoc as pages get added.

## Decision

- **Tailwind CSS v4** (`@tailwindcss/vite`), the standard default for a Vite + React app. No component library (e.g. shadcn/ui) yet — the UI is still a handful of simple forms and a list; a component library is easy to add later if the UI grows enough to justify it.
- **Palette** grounded in the product's actual subject matter — a cosmetic ingredient label — rather than a generic SaaS palette: a cool, paper-like off-white background (`#F1F3EE`), near-black ink text, hairline sage-grey borders, and exactly one alert color (`#B3412B`, a muted brick-red) reserved for allergen/error states. This mirrors ADR 1's own principle in the UI layer: a flag should mean something, so color is spent deliberately rather than scattered across badges and buttons.
- **Type**: Space Grotesk for headings/UI chrome, Space Mono for actual ingredient/allergen data (names, aliases, form values) — distinguishing "interface" from "label content" the way a real product label distinguishes brand typography from the printed ingredient panel.
- **Layout**: flat, hairline-bordered panels (no drop shadows, no uniform rounded-card kit), echoing a label/spec-sheet rather than a generic dashboard.
- Shared presentational components live in `src/ui/` (`Button`, `TextField`, `PasswordField`, `FormError`, `AuthCard`, `Page`), used by both `src/app/` and `src/admin/` — same visual language, kept as one small set of primitives instead of being duplicated per section.

## Consequences

- Any new page should reach for `src/ui/` primitives before writing new one-off styles, to keep the single flat/hairline/two-typeface system intact.
- The admin and end-user apps intentionally share one visual language, not two skins — simplest option while both are early and small; nothing stops giving admin a distinct skin later if that's ever worth doing.
- No component library dependency yet (Radix/shadcn, etc.) — revisit if/when the UI's interaction complexity (modals, comboboxes, etc.) outgrows hand-rolled primitives.
