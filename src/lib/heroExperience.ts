/**
 * Hero experience orchestration (client-side entry).
 *
 * The hero plays its 8s clip ONCE at real speed — no scrubbing, no seeking.
 * Scroll is locked for the duration so the intro is not competing with the
 * page, and text overlays are driven by the video's own currentTime rather
 * than by scroll position. When the clip ends (or the user skips) scroll
 * unlocks, the wordmark hands off to the sticky header, and the rest of the
 * page behaves like a normal document.
 *
 * No GSAP, no Lenis, no ScrollTrigger: the whole thing is three crossfades
 * and a class toggle, which CSS does better than a rAF loop.
 */

import { shouldUseFallback, waitForFullBuffer } from './detectFallback';

/** Fractions of the clip at which each text state owns the screen. */
const STATE_WINDOWS = [
  { id: 'intro-open', from: 0, to: 0.34 },
  { id: 'intro-mid', from: 0.42, to: 0.74 },
  { id: 'intro-brand', from: 0.72, to: 1.01 },
] as const;

/** Ceiling on the buffer wait before scroll comes back regardless. */
const BUFFER_TIMEOUT_MS = 4000;
/** Slack on top of the clip's own duration before we force the handoff. */
const PLAYBACK_SLACK_MS = 4000;

const root = document.documentElement;

function enterFallback(video?: HTMLVideoElement | null): void {
  root.classList.remove('intro-active');
  root.classList.add('fallback', 'intro-done');
  unlockScroll();

  // Stop the download outright. The element is display:none in fallback, but a
  // hidden <video autoplay preload="auto"> still pulls the whole file — which
  // is exactly what a saveData or 3G reader asked us not to do.
  if (video) {
    video.pause();
    video.removeAttribute('autoplay');
    video.removeAttribute('src');
    video.querySelectorAll('source').forEach((s) => s.remove());
    video.load();
  }
}

function lockScroll(): void {
  window.scrollTo(0, 0);
  root.classList.add('intro-locked');
}

function unlockScroll(): void {
  root.classList.remove('intro-locked');
}

export async function startHero(): Promise<void> {
  const video = document.getElementById('hero-video') as HTMLVideoElement | null;
  if (!video) {
    enterFallback();
    return;
  }

  // Reduced motion / saveData / slow connection never see the intro.
  if (shouldUseFallback()) {
    enterFallback(video);
    return;
  }

  // The markup carries `autoplay` so a JS-less client still gets the clip.
  // We're here, so take manual control of the playhead instead.
  video.pause();

  root.classList.add('intro-active');
  lockScroll();

  // Safety net: never leave the page unscrollable, whatever happens below.
  // Re-armed against the real duration once the clip actually starts.
  let watchdog = window.setTimeout(finish, BUFFER_TIMEOUT_MS + PLAYBACK_SLACK_MS);

  let finished = false;
  function finish(): void {
    if (finished) return;
    finished = true;
    clearTimeout(watchdog);
    unlockScroll();
    // Whatever beat is lit now fades out as the header wordmark fades in —
    // on a natural end that's the NHI LOCAL beat handing off. CSS owns it.
    root.classList.add('intro-done');
  }

  // Skip is always live, including while we're still buffering.
  document.getElementById('skip-intro')?.addEventListener('click', () => {
    video.pause();
    finish();
  });

  // Wait for the WHOLE clip, not just readyState 2. A first-frame gate lets
  // playback start and then outrun the download on 4G, which stalls the intro
  // mid-sentence — worse than never playing it.
  const timedOut = await waitForFullBuffer(video, BUFFER_TIMEOUT_MS);
  if (finished) return;
  if (timedOut) {
    clearTimeout(watchdog);
    enterFallback(video);
    return;
  }

  // Buffering is behind us; re-arm the watchdog against the clip itself so a
  // slow start doesn't eat the budget a stalled playback would need.
  clearTimeout(watchdog);
  watchdog = window.setTimeout(finish, video.duration * 1000 + PLAYBACK_SLACK_MS);

  video.addEventListener('timeupdate', () => {
    const { currentTime, duration } = video;
    if (!duration || !isFinite(duration)) return;
    const p = currentTime / duration;
    const active = STATE_WINDOWS.find((w) => p >= w.from && p < w.to);
    setState(active?.id ?? null);
  });

  video.addEventListener('ended', finish, { once: true });
  video.addEventListener('error', () => enterFallback(video), { once: true });

  try {
    video.currentTime = 0;
    await video.play();
  } catch {
    // Autoplay refused (muted playback normally is not, but policies vary).
    enterFallback(video);
  }
}

/** Exactly one text state is lit at a time; CSS owns the crossfade. */
function setState(id: string | null): void {
  for (const w of STATE_WINDOWS) {
    document.getElementById(w.id)?.classList.toggle('is-on', w.id === id);
  }
}

/** Hide the scroll cue once the reader has clearly taken the hint. */
function bindScrollCue(): void {
  const cue = document.getElementById('scroll-cue');
  if (!cue) return;
  window.addEventListener(
    'scroll',
    () => {
      cue.classList.toggle('is-hidden', window.scrollY > window.innerHeight * 0.25);
    },
    { passive: true }
  );
}

bindScrollCue();
startHero();
