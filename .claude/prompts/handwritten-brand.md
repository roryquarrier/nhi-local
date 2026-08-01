# Task: Redesign NHI LOCAL Brand Animation — Handwritten SVG Draw-In

## Project
`/home/hal/nhi-local` — Astro + React + Tailwind v4 static site. The hero section plays an 8-second video intro with text beats that fade in/out based on video currentTime.

## Context
The NHI LOCAL brand text (the `#intro-brand` beat) currently fades + slides up with a basic CSS transition. The user wants it to look like it's being **handwritten on screen** — an animated SVG stroke draw effect, and the fade-in should take longer (more deliberate, slower reveal).

## What to change

### 1. Create the handwritten NHI LOCAL as an animated SVG
- Replace the current text-based `#intro-brand` content in `src/components/Hero.astro` with an SVG-based version
- The SVG should contain the text "NHI LOCAL" as **stroke paths** (use SVG `<text>` with `stroke` + `fill: none`, or convert to paths)
- Animate it with CSS `stroke-dasharray` + `stroke-dashoffset` technique — the classic "signature draw-on" effect where the text appears to be written stroke by stroke
- The animation should be **slow and deliberate** — total draw duration around 2.5-3 seconds
- Use a **handwriting-style font** — check Google Fonts for something like "Caveat", "Kalam", "Gochi Hand", or similar that supports the handwritten aesthetic AND works for uppercase lettering. Load it in Layout.astro alongside the existing fonts.
- The text should be white/linen colored (matching `--color-linen: #f2f0ea`)

### 2. Animation timing
- The draw-in animation should start when `#intro-brand` gets the `.is-on` class (same trigger as now)
- The CSS transition duration for the intro-brand beat should be longer than the other beats
- After the draw completes, the text should remain visible (it already persists after intro-done — don't break that)

### 3. Files to modify
- `src/components/Hero.astro` — replace `#intro-brand` inner content with the SVG
- `src/styles/global.css` — add the stroke-dasharray animation CSS, scoped to the brand beat
- `src/layouts/Layout.astro` — add the handwritten font to the Google Fonts link

### 4. Important constraints
- **DO NOT change** the timing windows in `src/lib/heroExperience.ts` (STATE_WINDOWS)
- **DO NOT change** the intro-open or intro-mid beats
- **DO NOT change** any other section of the site
- **DO NOT deploy** — just build (`npm run build`) and report what changed
- The brand text must still work with the bilingual subtitle below it ("Man Thai Beach · Da Nang")
- Keep the subtitle as regular text (not handwritten) below the SVG
- Respect `prefers-reduced-motion: reduce` — if reduced motion is on, show the text instantly without the draw animation
- Test mobile: the SVG must scale down properly on small screens (use viewBox + responsive width)
