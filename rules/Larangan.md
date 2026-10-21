# STRICT UI/UX RULES: NO AI-SLOP DESIGN

1. COLOR & SURFACE:
- NEVER default to dark blue/purple/indigo/cyan palettes (`slate-950`, `indigo-500`, `purple-600`).
- NO decorative background blur orbs (`blur-3xl`) and NO `backdrop-blur` glassmorphism on content cards.
- Use solid surfaces with crisp `1px` borders, subtle shadows, and strict WCAG AA text contrast (minimum 4.5:1).

2. TYPOGRAPHY:
- NO gradient clip-text (`bg-clip-text`) on headings.
- Keep body copy left-aligned with a max width of `65ch`. Never center-align long paragraphs.
- Enforce `tabular-nums` on all numbers/metrics and right-align numeric table columns.

3. LAYOUT & ARCHITECTURE:
- NO sparkle/emoji pill badges (✨, 🚀) above H1 headings.
- NO fake CSS-box dashboard mockups.
- Do NOT repeat symmetric 3-column card grids (`grid-cols-3`) across consecutive sections.
- Do NOT generate B2B SaaS marketing sections (Pricing tiers, fake Testimonials, "Trusted by" logos, FAQ) for utility apps, dashboards, IoT tools, or portfolios. Open directly with the functional workspace.

4. CARDS, RADIUS & ICONS:
- NO nested cards (card inside a card). Separate inner items with whitespace or `1px` dividers (`divide-y`).
- Avoid uniform `rounded-2xl` and heavy shadows. Use restrained radii (`6px`–`10px`) with concentric inner radii.
- NEVER use OS emojis as UI icons. Avoid the cliché `Sparkles`, `Zap`, `Shield`, `Rocket` icon boxes.

5. INTERACTIVITY & STATES:
- NEVER add hover-lift (`hover:-translate-y-1`) or hover-scale (`hover:scale-105`) to non-clickable cards.
- NO dead UI: every search bar, filter, notification bell, mobile menu, and link must be functional (zero `href="#"` placeholders).
- Limit to ONE visually dominant Primary button per view.
- Always implement Empty State (`data = []`), Loading State, and Inline Validation Error State.

6. COPYWRITING & DATA:
- BANNED words: "Revolutionize", "Supercharge", "Seamless", "Cutting-edge", "Next-Gen", "Unleash", "Elevate", "Powering the future", "Solusi Masa Depan", "Transformasi Digital".
- Write specific, concrete microcopy describing actual functionality.
- NO fake testimonials or hardcoded "+12.5%" green badges on every KPI card. Match metric polarity (rising errors = red).

7. ASSETS, MEDIA & INPUT FORMS:
- NO generic 3D glossy/clay illustrations (e.g., floating puffy cloud, shiny spheres, isometric floating coins).
- NO cheesy corporate stock photos (e.g., suited people smiling artificially or giving thumbs up). Use actual schematic diagrams, technical wireframes, real UI previews, or typographic treatments.
- NO neon/glowing focus rings on inputs (`focus:ring-4 focus:ring-blue-500` or `outline: glow`). Use crisp, restrained 1px focus styles (`focus:ring-1 focus:ring-zinc-900 focus:outline-none`).

8. BLACKLISTED TOKENS & PATTERNS (Self-Audit Pre-Flight Checklist):
Scan every line of output before finalizing. If any of these tokens appear, rewrite immediately:
- Tailwind: `bg-clip-text`, `text-transparent bg-gradient-`, `backdrop-blur`, `blur-xl`, `blur-2xl`, `blur-3xl`, `rounded-2xl`, `rounded-3xl` (on cards/containers), `hover:-translate-y-1`, `hover:scale-105`, `shadow-2xl`, `indigo-600`, `purple-600`.
- Vanilla CSS: `backdrop-filter: blur`, `filter: blur`, `-webkit-background-clip: text`, `border-radius: 20px+` (except avatars/pills), `box-shadow: 0 20px 25px`.
- Icons/Pills: OS Emojis (✨, 🚀, 💡, 🔥, ⚡) used as feature bullets or heading badges.

9. ANTI-MODEL FINGERPRINTS:
- **Anti-Claude**: No dark-slate + indigo + `emerald-500` status text combos; do not force a left sidebar + 4 top KPI cards (with "+12.5% from last month") on every app; do not put thin-outline icons on every single menu item.
- **Anti-ChatGPT**: No sterile white/light-gray pages with standard `#2563eb` blue buttons and boxy drop shadows; NEVER use raw colorful Emojis (🚀, 💡, 🔒, 📊) as UI icons; no top-to-bottom center-aligned symmetry ending in a plain black copyright strip.
- **Anti-Gemini**: No pitch-black cyberpunk themes with high-contrast neon cyan/purple/green glows; no overly round pillow/capsule corners (`rounded-3xl`/`rounded-full`) on all cards; no floating capsule top navbars; no oversized thick icons paired with random progress bars.