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
    duration: 1.2,
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

  // Latest-value-wins: scroll updates overwrite a shared variable. The seek
  // loop reads the newest value, so fast scrolls don't lurch to stale positions.
  let latestProgress = 0;
  let seeking = false;

  // requestVideoFrameCallback (Chrome/Edge/Safari 17+) fires exactly when a
  // seeked frame has been painted — the signal that the previous seek is done.
  const rvfc =
    'requestVideoFrameCallback' in video
      ? (video as HTMLVideoElement & {
          requestVideoFrameCallback: (
            cb: (now: number, metadata: { presentationTime: number }) => void
          ) => number;
        })
      : null;

  const doSeek = () => {
    const targetTime = latestProgress * duration;
    if (Math.abs(targetTime - video.currentTime) <= 0.008) {
      seeking = false;
      return;
    }

    seeking = true;
    video.currentTime = targetTime;

    // When the frame paints, clear the seeking flag and chase any newer progress.
    if (rvfc) {
      rvfc.requestVideoFrameCallback(() => {
        seeking = false;
        if (Math.abs(latestProgress * duration - video.currentTime) > 0.008) {
          doSeek();
        }
      });
    } else {
      // Fallback: assume the seek is done on the next frame.
      requestAnimationFrame(() => {
        seeking = false;
        if (Math.abs(latestProgress * duration - video.currentTime) > 0.008) {
          doSeek();
        }
      });
    }
  };

  const scrub = (progress: number) => {
    latestProgress = progress;
    if (!seeking) {
      doSeek();
    }
    // If a seek is in-flight, latestProgress is updated so it will be
    // picked up the moment the current frame paints (chase logic above).
  };

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
