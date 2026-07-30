/**
 * Scroll system — single source of truth for GSAP + Lenis + ScrollTrigger.
 *
 * ScrollTrigger is registered EXACTLY ONCE in this module. No other module
 * may call gsap.registerPlugin(ScrollTrigger). Duplicate registration is a
 * build failure per the plan.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register ScrollTrigger EXACTLY ONCE — duplicate registration is a build failure
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export function initScrollSystem(video: HTMLVideoElement): Lenis {
  // Lenis drives scroll; GSAP reads from it
  const lenis = new Lenis({
    // 1.2 made the playhead visibly lag the wheel — the scrub reads scroll
    // position, so Lenis' settle time is added directly to the video's
    // response time. 0.9 keeps the easing but tightens that lag.
    duration: 0.9,
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Wait for video metadata before binding the scrub
  if (video.readyState < 2) {
    video.addEventListener('loadedmetadata', () => bindScrub(video), { once: true });
  } else {
    bindScrub(video);
  }

  return lenis;
}

function bindScrub(video: HTMLVideoElement) {
  const duration = video.duration;
  if (!duration || !isFinite(duration)) return;

  const FPS = 24;
  const LAST_FRAME = Math.max(0, Math.round(duration * FPS) - 1);

  // Latest-value-wins: every scroll update overwrites this. The RAF loop
  // reads the newest value once per frame and issues a single seek. We do
  // NOT gate on the 'seeked' event or requestVideoFrameCallback — gating
  // serializes seeks (each decode must finish before the next starts),
  // which makes the playhead move in discrete steps instead of flowing.
  // Setting currentTime while a seek is in-flight is safe: the browser
  // coalesces and retargets to the latest value automatically.
  let latestProgress = 0;
  let needsSeek = false;
  let lastFrameSent = -1;

  // De-duplicate on the requested FRAME INDEX, not on a time epsilon against
  // video.currentTime. currentTime reports the *snapped* frame time after a
  // seek, never the requested time, so the old `>= FRAME / 2` test compared
  // two different quantities and had to be generous to compensate — it
  // swallowed real scroll movement, then released it as a visible jump.
  // Comparing frame indices is exact: one seek per displayed frame change,
  // no wasted decodes and no dropped movement.
  const onFrame = () => {
    if (needsSeek) {
      const frame = Math.min(Math.round(latestProgress * duration * FPS), LAST_FRAME);
      if (frame !== lastFrameSent) {
        lastFrameSent = frame;
        // Aim at the frame's midpoint: seeking to exactly frame/FPS sits on a
        // boundary where float rounding can resolve to the previous frame.
        video.currentTime = (frame + 0.5) / FPS;
      }
      needsSeek = false;
    }
    requestAnimationFrame(onFrame);
  };

  const scrub = (progress: number) => {
    latestProgress = progress;
    needsSeek = true;
  };

  requestAnimationFrame(onFrame);

  ScrollTrigger.create({
    trigger: '#hero-section',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => scrub(self.progress),
  });
}

/**
 * "Play Tour" button: auto-scrolls the hero section from top to bottom over
 * `durationMs`, driving the video scrub. Manual scroll input cancels the tour.
 */
export function initPlayTour(lenis: Lenis) {
  const button = document.getElementById('play-tour-btn');
  if (!button) return;

  let isPlaying = false;
  let rafId: number | null = null;
  let cancelledByUser = false;

  button.addEventListener('click', () => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  });

  function play() {
    if (!button) return;
    isPlaying = true;
    cancelledByUser = false;
    // Bilingual labels are CSS-swapped via [data-playing]; never touch textContent.
    button.setAttribute('data-playing', '');
    const start = window.scrollY;
    const hero = document.getElementById('hero-section');
    const end = hero ? hero.offsetHeight - window.innerHeight : 0;
    const startTime = performance.now();
    const durationMs = 20000; // 20 seconds for full scroll

    function step(now: number) {
      if (!isPlaying || cancelledByUser) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
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
    rafId = null;
    button?.removeAttribute('data-playing');
  }

  // Cancel the tour when the user scrolls manually (wheel/touch).
  // Lenis fires 'scroll' for both programmatic and manual scrolls, so we listen
  // to the raw wheel + touchstart events as the manual-signal heuristic.
  const cancelOnManual = () => {
    if (isPlaying) {
      cancelledByUser = true;
      stop();
    }
  };
  window.addEventListener('wheel', cancelOnManual, { passive: true });
  window.addEventListener('touchmove', cancelOnManual, { passive: true });
}
