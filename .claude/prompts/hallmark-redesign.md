# Task: Redesign Booking Section + Polish — Hallmark Anti-AI-Slop

## Project
`/home/hal/nhi-local` — Astro + React + Tailwind v4 static site for a SUP/surf/freedive business in Da Nang, Vietnam. Bilingual EN/VI.

## Skill
Load and follow the **Hallmark** skill at `~/.hermes/skills/hallmark/SKILL.md`. Use `hallmark redesign` verb for the booking section, and apply anti-pattern fixes across remaining sections.

## What was already fixed (don't redo)
- 3-col HowItWorks card grid → vertical numbered list ✓
- Eyebrows stripped from all sections ✓
- Hero copy biased left ✓
- 100vw → 100% ✓
- Section padding varied ✓
- Booking CTA transition specified ✓

## What needs fixing (DO THESE)

### 1. CRITICAL: Booking pricing tiles (`src/components/BookingSection.tsx`)
Still a **3-column equal-width card grid** with identical heights — the exact same slop pattern. This is a React component using Tailwind classes. Redesign it:
- Break the grid. Use asymmetric layout, vertical stack, or typographic pricing list.
- The three services (SUP 300,000₫ / Surf 1,600,000₫ / Freedive 1,500,000₫) should NOT look like identical cards.
- Preserve all functionality: service selection, language toggle (`langchange` event), cal.com trigger (EN), Zalo link (VI).
- Keep the `data-lang` pattern for bilingual support or use the `lang` state from useState.

### 2. MAJOR: Remove last mono uppercase label
`BookingSection.tsx` still has "SESSION TIMES" / "Khung giờ" as `font-mono tracking-widest uppercase`. Remove it or convert to a clean inline label.

### 3. MINOR: Display face for headings
Currently Be Vietnam Pro does everything (headings + body). Consider adding a display face for h2 headings — check what Google Fonts pairs well with Be Vietnam Pro for a Vietnamese-language site. Update `Layout.astro` font link and the Tailwind `@theme` block in `global.css`.

## Constraints
- DO NOT change copy content (translations.ts) — only visual/structural changes
- DO NOT break bilingual support (EN/VI toggle)
- DO NOT break cal.com or Zalo booking flows
- DO NOT touch the hero video or intro experience
- Preserve all existing Tailwind tokens (--color-dawn, --color-linen, --color-tungsten, --color-coffee, --color-lilac, --color-sea)
- After changes: run `npm run build` to verify the build passes
- Do NOT deploy — just build and report what changed
