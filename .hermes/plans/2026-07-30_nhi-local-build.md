# NHI LOCAL — Implementation Plan

> **For the builder:** Follow this plan task-by-task. Report blockers to Hermes, don't invent answers.

**Goal:** Build a bilingual (EN/VI) scroll-driven video landing page for Nhi Local, a SUP/Surf/Freedive business in Da Nang, Vietnam.

**Architecture:** Astro static site with React 19 islands for interactivity. Video is fixed full-bleed background with playhead bound to scroll progress via GSAP ScrollTrigger + Lenis. Static fallback (poster + stacked sections) is the PRIMARY experience for Vietnamese mobile data users. No backend, no Stripe, no server code. EN books via cal.com embed, VI books via Zalo deep link.

**Tech Stack:** Astro, React 19, Tailwind CSS v4 (`@tailwindcss/vite`), GSAP + ScrollTrigger, Lenis (`lenis`), lucide-react. NOT `@studio-freight/lenis` (deprecated). NOT stripe.

**Project root:** `/home/hal/nhi-local`

**Existing assets:**
- `public/media/hero_danang_sup.mp4` — 720x1280, 24fps, 8.04s, 2.8MB, H264, keyframe interval 3, no audio, faststart
- `public/media/hero_poster.jpg` — 720x1280 poster frame, 48KB

---

## Design Tokens

```css
--dawn-black:   #0E1420;  /* page base, scrims */
--linen:        #F2F0EA;  /* primary text on dark */
--tungsten:     #FFB25E;  /* CTAs, active states — actions only */
--coffee:       #3B2417;  /* secondary surfaces */
--lilac-dawn:   #B9C4D0;  /* secondary text, borders */
--sea:          #5E8C8A;  /* tertiary accents */
```

`--tungsten` is reserved for interactive elements. If it isn't clickable, it isn't tungsten.

## Typography

- One monospace face for timestamps/numeric data (clock ticker)
- One clean sans for everything else
- Both MUST carry full Vietnamese diacritics — verify with `ế ượ ỗ ằ`
- Recommended: "Be Vietnam Pro" (Google Fonts) for sans, "JetBrains Mono" for mono — both have full Vietnamese support
- Fallback: system-ui sans, ui-monospace mono

## Video Element

```html
<video id="hero-video" playsinline muted preload="auto"
       poster="/media/hero_poster.jpg">
  <source media="(min-aspect-ratio: 1/1)" src="/media/hero_danang_sup.mp4" type="video/mp4">
  <source src="/media/hero_danang_sup.mp4" type="video/mp4">
</video>
```

---

## Task 1: Scaffold the Astro project

**Objective:** Create the Astro project with all dependencies installed.

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`
- Create: `src/styles/global.css` (design tokens + Tailwind import)
- Create: `src/layouts/Layout.astro` (base HTML shell)
- Create: `src/pages/index.astro` (main page)

**Steps:**

1. From `/home/hal/nhi-local`, initialize the project:

```bash
cd /home/hal/nhi-local
npm init -y
npm install astro @astrojs/react @astrojs/tailwind react react-dom
npm install tailwindcss @tailwindcss/vite
npm install gsap lenis lucide-react
npm install @types/react @types/react-dom
```

Note: Do NOT install `stripe`, `@stripe/stripe-js`, `express`, `server`, or any backend package.

2. Create `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
});
```

3. Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", ".astro/types.d.ts"],
  "exclude": ["dist"]
}
```

4. Create `src/styles/global.css` with Tailwind v4 import and design tokens:

```css
@import "tailwindcss";

:root {
  --dawn-black: #0E1420;
  --linen: #F2F0EA;
  --tungsten: #FFB25E;
  --coffee: #3B2417;
  --lilac-dawn: #B9C4D0;
  --sea: #5E8C8A;
}

@font-face {
  font-family: 'Be Vietnam Pro';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/bevietnampro/v11/QNVK.woff2) format('woff2');
}
```

Note: Use Google Fonts `@font-face` or `<link>` for Be Vietnam Pro + JetBrains Mono. Verify Vietnamese diacritics render: ế ượ ỗ ằ.

5. Verify the project scaffolds correctly:

```bash
npx astro check
```

Expected: No errors (may have warnings about empty pages).

---

## Task 2: Base layout with SEO, fonts, and language setup

**Objective:** Create the base HTML layout with Vietnamese-capable fonts, SEO meta, and language attribute support.

**Files:**
- Create: `src/layouts/Layout.astro`

**Implementation:**

```astro
---
interface Props {
  lang?: 'en' | 'vi';
  title?: string;
  description?: string;
}

const lang = Astro.props.lang ?? 'en';
const title = Astro.props.title ?? 'Nhi Local — Sunrise SUP on My Khe';
const description = Astro.props.description ?? 'Stand-up paddleboard, surf, and freedive sessions on Man Thai Beach, Da Nang. Small groups, equipment provided, 60-minute sessions.';

import '../styles/global.css';
---

<!doctype html>
<html lang={lang}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
  
  <!-- hreflang alternates -->
  <link rel="alternate" hreflang="en" href="/" />
  <link rel="alternate" hreflang="vi" href="/?lang=vi" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content="/og-image.jpg" />
  <meta property="og:url" content="https://nhilocal.com" />
  
  <!-- Twitter card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="/og-image.jpg" />
  
  <!-- Fonts: Be Vietnam Pro (sans, full Vietnamese diacritics) + JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  
  <!-- cal.com floating popup embed -->
  <script type="text/javascript">
    (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d=C.document; C.Cal=C.Cal||function () { let cal=C.Cal; let ar=arguments; if (!cal.loaded) { cal.ns={}; cal.q=cal.q||[]; d.head.appendChild(d.createElement("script")).src=A; cal.loaded=true; } if (ar[0]===L) { const api=function () { p(api, arguments); }; const namespace=ar[1]; api.q=api.q||[]; if(typeof namespace==="string"){cal.ns[namespace]=cal.ns[namespace]||api;p(cal.ns[namespace],ar);p(cal,["initNamespace",namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
    Cal("init", "sup", {origin:"https://app.cal.com"});
    Cal.config = Cal.config || {};
    Cal.config.forwardQueryParams = true;
    Cal.ns.sup("floatingButton", {"calLink":"rory-quarrier-nsavjf/sup","config":{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}});
    Cal.ns.sup("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
  </script>
</head>
<body class="bg-[#0E1420] text-[#F2F0EA] font-sans antialiased">
  <slot />
</body>
</html>
```

---

## Task 3: Language toggle component (React island)

**Objective:** Persistent VI/EN toggle, top-right, visible at all scroll positions. Switches copy and conversion funnel (not price).

**Files:**
- Create: `src/components/LanguageToggle.tsx`

**Implementation:**

```tsx
import { useEffect, useState } from 'react';

type Lang = 'en' | 'vi';

export default function LanguageToggle() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const url = new URL(window.location.href);
    const param = url.searchParams.get('lang');
    if (param === 'vi' || param === 'en') setLang(param);

    // Apply lang to document
    document.documentElement.lang = lang;
  }, []);

  const toggle = () => {
    const newLang = lang === 'en' ? 'vi' : 'en';
    setLang(newLang);
    document.documentElement.lang = newLang;

    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLang);
    window.history.replaceState({}, '', url);

    // Dispatch custom event for other components to react to
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: newLang } }));
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-[#B9C4D0]/30 bg-[#0E1420]/80 px-4 py-2 font-mono text-sm tracking-wider backdrop-blur-sm transition-colors hover:border-[#FFB25E]/50"
      aria-label="Toggle language"
    >
      <span className={lang === 'en' ? 'text-[#FFB25E]' : 'text-[#B9C4D0]'}>EN</span>
      <span className="text-[#B9C4D0]/40">/</span>
      <span className={lang === 'vi' ? 'text-[#FFB25E]' : 'text-[#B9C4D0]'}>VI</span>
    </button>
  );
}
```

---

## Task 4: Static fallback system — FIRST, not last

**Objective:** Detect when the scroll-scrub experience can't run and switch to static fallback (poster + stacked sections). This is the PRIMARY experience for the target audience.

**Files:**
- Create: `src/lib/detectFallback.ts`

**Implementation:**

```typescript
export function shouldUseFallback(): boolean {
  // 1. prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;

  // 2. iOS Safari — frame-accurate scrubbing is unreliable
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return true;

  // 3. saveData or slow connection
  const conn = (navigator as any).connection;
  if (conn) {
    if (conn.saveData) return true;
    const effectiveType = conn.effectiveType;
    if (effectiveType === '2g' || effectiveType === '3g' || effectiveType === 'slow-2g') return true;
  }

  return false;
}

export function waitForVideoReady(video: HTMLVideoElement, timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    if (video.readyState >= 2) {
      resolve(false);
      return;
    }

    let done = false;
    const finish = (result: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      video.removeEventListener('loadeddata', onLoad);
      resolve(result);
    };

    const onLoad = () => finish(false);
    const timer = setTimeout(() => finish(true), timeoutMs);

    video.addEventListener('loadeddata', onLoad);
    video.load();
  });
}
```

---

## Task 5: Scroll system module (GSAP + Lenis, registered ONCE)

**Objective:** Single module that registers ScrollTrigger once, sets up Lenis, and binds video.currentTime to scroll progress via requestAnimationFrame.

**Files:**
- Create: `src/lib/scrollSystem.ts`

**Implementation:**

```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register ScrollTrigger EXACTLY ONCE — duplicate registration is a build failure
gsap.registerPlugin(ScrollTrigger);

export function initScrollSystem(video: HTMLVideoElement) {
  // Lenis drives scroll, GSAP reads from it
  const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Wait for video metadata before binding
  if (video.readyState < 2) {
    video.addEventListener('loadedmetadata', () => bindScrub(video, lenis), { once: true });
  } else {
    bindScrub(video, lenis);
  }

  return lenis;
}

function bindScrub(video: HTMLVideoElement, _lenis: Lenis) {
  const duration = video.duration;
  if (!duration || !isFinite(duration)) return;

  let rafId: number | null = null;
  let lastTime = -1;

  const scrub = (progress: number) => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      const targetTime = progress * duration;
      if (Math.abs(targetTime - lastTime) > 0.01) {
        video.currentTime = targetTime;
        lastTime = targetTime;
      }
      rafId = null;
    });
  };

  ScrollTrigger.create({
    trigger: '#hero-section',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => scrub(self.progress),
  });
}

export function initPlayTour(video: HTMLVideoElement, lenis: Lenis) {
  const button = document.getElementById('play-tour-btn');
  if (!button) return;

  let isPlaying = false;
  let rafId: number | null = null;

  button.addEventListener('click', () => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  });

  function play() {
    isPlaying = true;
    button.textContent = 'Pause Tour';
    const start = window.scrollY;
    const end = document.getElementById('hero-section')!.offsetHeight - window.innerHeight;
    const startTime = performance.now();
    const duration = 20000; // 20 seconds for full scroll

    function step(now: number) {
      if (!isPlaying) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const target = start + (end - start) * progress;
      lenis.scrollTo(target, { immediate: true });

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        stop();
      }
    }
    rafId = requestAnimationFrame(step);
  }

  function stop() {
    isPlaying = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    button.textContent = 'Play Tour';
  }

  // Stop on manual scroll input
  lenis.on('scroll', () => {
    // Only stop if user is actively scrolling (not via scrollTo)
    // This is a heuristic — manual scroll detection
  });
}

export { gsap, ScrollTrigger };
```

---

## Task 6: Hero section with video background

**Objective:** Fixed full-bleed video background with gradient scrims. Content sections pinned to scroll waypoints.

**Files:**
- Create: `src/components/Hero.astro`

This is a large file. It contains:
- The video element (from the template above)
- Gradient scrim overlays
- 5 milestone content blocks (0%, 25%, 50%, 75%, 100%) that fade in/out
- Clock ticker (mono, starts 04:07, reaches 05:30 at 100%)
- NHI LOCAL wordmark that resolves at 50% and docks into sticky header
- Service tiles (SUP/Surf/Freedive) at 75% with SUP pre-selected
- Booking bar at 100%
- Language toggle (React island)
- Play Tour button

**Key implementation notes:**
- Every overlaid text block sits on a gradient scrim: `--dawn-black` at 70% fading to transparent
- Verify against the BRIGHTEST frame (the sunrise beat at the end), not an average frame
- Clock increments with scroll, reading 04:07 at 25% and 05:30 at 100%
- The NHI LOCAL wordmark at 50% does a shared-element transition: shrinks and docks into a sticky header that persists after 50%

---

## Task 7: Below-video sections

**Objective:** Conventional sections that appear after the scroll-scrub completes.

**Files:**
- Create: `src/components/sections/MeetNhi.astro`
- Create: `src/components/sections/MediaCarousel.astro`
- Create: `src/components/sections/HowItWorks.astro`
- Create: `src/components/sections/MeetingPoint.astro`
- Create: `src/components/sections/FAQ.astro`
- Create: `src/components/sections/Footer.astro`

Content:
- **Meet Nhi:** Face of the business, named, photographed, prominent. Use a labelled grey placeholder at correct aspect ratio.
- **Media carousel:** Grey placeholder blocks at correct aspect ratios with fixed, predictable filenames (e.g. `placeholder-nhi-1.jpg`, `placeholder-sup-1.jpg`).
- **How it works:** Simple 3-4 step explanation.
- **Meeting point:** Map link/embed for Man Thai Beach. Use Google Maps embed with a placeholder pin.
- **FAQ:** Common questions. NO fabricated answers for unresolved items — mark them `<!-- TODO -->`.
- **Footer:** Contact info, socials, phone/Zalo.

**Business facts:**
- Name: Nhi Local
- Location: Man Thai Beach, Da Nang, Vietnam
- Phone/Zalo: +84 90 500 28 13
- Socials: Facebook, Instagram, TikTok
- Equipment provided. Sessions are 1 hour.
- Weather/cancellation handled in chat after payment — no policy on page.

**Social links:**
- Facebook: https://www.facebook.com/share/1J98ZsA5gF/
- Instagram: https://www.instagram.com/nhilocal
- TikTok: https://www.tiktok.com/@thuynhile_

---

## Task 8: Bilingual content system

**Objective:** All content in both EN and VI. Toggle switches copy and conversion funnel, NOT price.

**Files:**
- Create: `src/lib/translations.ts`

**Pricing — one public price for everyone:**

| Service | Price |
|---|---|
| SUP | 300,000₫ |
| Surfing | 1,600,000₫ |
| Freediving | 1,500,000₫ |

VI version shows the same prices plus: "Liên hệ Zalo để có giá tốt hơn." (Contact Zalo for a better rate.)

**Booking funnels:**
- EN → cal.com embed (floating popup already loaded in Layout.astro)
- VI → Zalo deep link to `https://zalo.me/84905002813` with pre-filled message where URL scheme allows

**Vietnamese copy rules:**
- Must be written as Vietnamese, not machine-translated from English
- Where unsure of idiomatic phrasing, mark `<!-- TODO: VI review -->` rather than guessing
- Set `lang` correctly per version

**Unresolved items (mark TODO, don't invent):**
- Session times: 04:45 / 05:30 / 06:15 (proposed, not confirmed)
- Maximum group size
- Age limits and swimming-ability requirements (especially freediving)
- Exact Google Maps pin for Man Thai meeting point
- Whether the personal TikTok handle should be linked at all

---

## Task 9: Booking section

**Objective:** Both booking paths reachable from every scroll position and in static fallback.

**EN path:**
- cal.com floating popup is already loaded globally (Task 2)
- Add an inline cal.com embed in the booking section for non-floating access
- Health declaration is handled inside cal.com's booking questions (not a custom form field on the page)

**VI path:**
- Zalo deep link: `https://zalo.me/84905002813`
- Pre-filled message where URL scheme allows

**Availability display:**
- If session times with availability dots are shown, they must reflect real cal.com data via the API
- If real data is not wired, omit dots and show session times as plain text
- NEVER display fabricated availability

**Files:**
- Create: `src/components/BookingSection.tsx` (React island for interactive language-aware booking)

---

## Task 10: Favicon, sitemap, robots, OG image placeholder

**Files:**
- Create: `public/favicon.svg` (simple SVG with NHI LOCAL wordmark)
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Create: `public/og-image.jpg` (labelled placeholder, 1200x630)

---

## Task 11: Build and verify

**Objective:** Clean build with zero TypeScript errors, zero unused imports, zero duplicate ScrollTrigger registrations.

```bash
npm run build
```

**Verification checklist:**
- [ ] `npm run build` exits 0
- [ ] No TypeScript errors
- [ ] No unused imports
- [ ] ScrollTrigger registered exactly once (grep the codebase)
- [ ] Static fallback renders all content and both booking paths
- [ ] Video element has correct responsive source swap
- [ ] Language toggle works (EN ↔ VI)
- [ ] All TODO comments are in place for unresolved items
- [ ] Vietnamese diacritics render correctly: ế ượ ỗ ằ
- [ ] Favicon, sitemap, robots.txt present
- [ ] No Stripe SDK, no backend code, no server code

---

## HARD RULES (do not violate)

1. The static fallback is not optional and is not a later task. Build it in Phase 2 (Task 4).
2. No backend. No Stripe SDK, no API routes, no server. Static output only.
3. No fabricated content. No invented reviews, credentials, availability, or policies. Placeholders are acceptable; fiction is not.
4. No dual pricing. One public price, Zalo invitation on the VI version.
5. Vietnamese is a first-class language, not a translation layer. Check diacritic rendering in the chosen typeface.
6. Report blockers to Hermes. Do not work around missing credentials, missing assets, or missing decisions.