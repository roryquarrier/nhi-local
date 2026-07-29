/**
 * Hero experience orchestration (client-side entry).
 *
 * Decides between the scroll-scrub experience and the static fallback, then
 * wires the milestone overlays, clock ticker, wordmark dock, and booking bar
 * to scroll progress. All GSAP/ScrollTrigger access goes through
 * scrollSystem.ts — ScrollTrigger is registered exactly once, there.
 */

import { gsap, ScrollTrigger, initScrollSystem, initPlayTour } from './scrollSystem';
import { shouldUseFallback, waitForVideoReady } from './detectFallback';

const CLOCK_START_MIN = 4 * 60 + 7; // 04:07 at the 25% milestone
const CLOCK_END_MIN = 5 * 60 + 30; // 05:30 at 100%

function formatClock(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function enterFallback(): void {
  document.documentElement.classList.add('fallback');
}

export async function startHero(): Promise<void> {
  const video = document.getElementById('hero-video') as HTMLVideoElement | null;
  if (!video) {
    enterFallback();
    return;
  }

  // Static fallback is the PRIMARY experience: reduced-motion, iOS Safari,
  // saveData/slow connections bail out immediately, before any video work.
  if (shouldUseFallback()) {
    enterFallback();
    return;
  }

  // Video must reach readyState >= 2 within 3s or we fall back.
  const timedOut = await waitForVideoReady(video, 3000);
  if (timedOut) {
    enterFallback();
    return;
  }

  const lenis = initScrollSystem(video);
  initPlayTour(lenis);
  bindOverlays();

  // Smooth-scroll in-page anchors (hero tiles → booking section) through Lenis.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href') ?? '');
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: -20 });
      }
    });
  });
}

/**
 * One ScrollTrigger drives every overlay from hero progress. Milestones fade
 * in and out — nothing persists except the docked header (after 50%) and the
 * booking bar (after 100%).
 */
function bindOverlays(): void {
  const m0 = document.getElementById('milestone-0');
  const m25 = document.getElementById('milestone-25');
  const m50 = document.getElementById('milestone-50');
  const m75 = document.getElementById('milestone-75');
  const clock = document.getElementById('clock-ticker');
  const clockTime = document.getElementById('clock-time');
  const header = document.getElementById('dock-header');
  const bookingBar = document.getElementById('booking-bar');
  const wordmark = document.getElementById('hero-wordmark');

  // Fade window: 0 outside [fadeIn, fadeOut], 1 in the middle, ramped edges.
  const window01 = (p: number, start: number, full: number, hold: number, end: number) => {
    if (p <= start || p >= end) return 0;
    if (p < full) return (p - start) / (full - start);
    if (p <= hold) return 1;
    return 1 - (p - hold) / (end - hold);
  };

  // autoAlpha drives opacity AND visibility: overlays start visibility:hidden
  // in CSS, so they stay unfocusable/unclickable until actually revealed.
  const setBlock = (el: HTMLElement | null, opacity: number, interactive = false) => {
    if (!el) return;
    gsap.set(el, {
      autoAlpha: opacity,
      pointerEvents: interactive && opacity > 0.5 ? 'auto' : 'none',
    });
  };

  ScrollTrigger.create({
    trigger: '#hero-section',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      // Milestone fades
      setBlock(m0, window01(p, -0.001, 0.0, 0.08, 0.2));
      setBlock(m25, window01(p, 0.16, 0.22, 0.36, 0.46));
      setBlock(m50, window01(p, 0.42, 0.48, 0.56, 0.64));
      setBlock(m75, window01(p, 0.62, 0.68, 0.86, 0.95), true);

      // Clock ticker: appears at 25%, reads 04:07 there, 05:30 at 100%.
      setBlock(clock, p < 0.18 ? 0 : Math.min(1, (p - 0.18) / 0.06));
      if (clockTime) {
        const t = Math.min(1, Math.max(0, (p - 0.25) / 0.75));
        clockTime.textContent = formatClock(
          CLOCK_START_MIN + t * (CLOCK_END_MIN - CLOCK_START_MIN)
        );
      }

      // Shared-element wordmark: shrinks and rises toward the header slot
      // through the back half of its milestone window.
      if (wordmark) {
        const d = Math.min(1, Math.max(0, (p - 0.52) / 0.1));
        const rise = window.innerHeight * 0.5 - 44; // center → header line
        gsap.set(wordmark, {
          scale: 1 - d * 0.68,
          y: -d * rise,
          transformOrigin: 'center top',
        });
      }

      // Header persists after 50%; booking bar docks permanently at 100%.
      header?.classList.toggle('visible', p >= 0.56);
      bookingBar?.classList.toggle('visible', p >= 0.99);
    },
  });
}

startHero();
