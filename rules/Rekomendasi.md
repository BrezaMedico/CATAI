# MODERN HUMAN-CRAFTED UI SPECIFICATION (ANTI-SLOP REPLACEMENT)

Apply the following positive design system rules to achieve an authentic, human-designed aesthetic:

1. WARM & GROUNDED COLOR SYSTEM:
- Primary Background: Warm Alabaster (`#FAF8F5`) for light mode, or Warm Obsidian (`#0E0F0E`) for dark mode.
- Secondary Surface: Soft Sandstone (`#F2EFE9`) or Elevated Charcoal (`#171917`).
- Text: Deep Ink (`#18181B`) for primary text; Warm Zinc (`#52525B`) for secondary text.
- Accent: Use ONE solid, grounded accent color such as Terracotta (`#D94E34`), Cobalt Blue (`#0047FF`), or Botanical Green (`#2D6A4F`).
- Borders: Crisp `1px` solid structural borders (`#E4E0D8` in light mode, `#262926` in dark mode).

2. EXPRESSIVE TYPOGRAPHY SYSTEM:
- Pair three font roles:
  1. Headings: `Plus Jakarta Sans` (semi-bold, tight tracking `-0.03em`) or `Instrument Serif` for editorial warmth.
  2. Body & UI: Clean sans-serif (`Plus Jakarta Sans` or `DM Sans`), left-aligned, constrained to `65ch`.
  3. Metadata, Numbers, IDs, & Section Indexes: `JetBrains Mono` with `tabular-nums`.
- Replace decorative feature icons with monospace index labels (e.g., `01 / FEATURE`, `02 / WORKFLOW`).

3. ARCHITECTURAL LAYOUT & SURFACES:
- Use asymmetric layouts (e.g., 4-column sticky section header on the left + 8-column structured content on the right).
- Replace floating shadowed cards with an **Architectural Hairline Grid** (shared `1px` borders using `divide-x` and `divide-y` with generous internal padding `p-6` to `p-8`).
- Keep border-radius crisp and restrained: `6px` (`rounded-md`) for buttons/inputs, `8px` (`rounded-lg`) for containers.

4. TACTILE & HONEST INTERACTION:
- Give clickable buttons physical feedback: `active:translate-y-[1px]` or `active:scale-[0.99]` with fast transitions (`150ms ease-out`).
- In the Hero section, immediately embed an interactive functional component (live search, filterable table, or real workflow preview) instead of static decorative graphics.

5. CRISP FORM & INPUT SPECIFICATIONS:
- Surface: Crisp opaque background (`#FFFFFF` for light mode, `#141514` for dark mode).
- Borders: `1px solid #E4E0D8` (light) or `1px solid #2B2F2B` (dark).
- Focus State: Restrained single-pixel accent ring (`focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-200`). Never use wide glowing neon halos.
- Validation: Inline error messages below the field with explicit red text (`#DC2626`) and micro-icon; never rely on border color alone.

6. AUTHENTIC VISUAL ASSET ALTERNATIVES:
Instead of cheesy stock photos or floating 3D clay graphics, use:
- Live Interactive Components: Sparklines, mini data visualizers, functional filters.
- Monospace Data Streams: Clean terminal-style logs, audit tables, or code snippets.
- Architectural Diagrams: SVG wireframes with 1px hairline strokes matching the border tokens.
- Authentic Product Previews: Dense, real-data cards with functional badges.