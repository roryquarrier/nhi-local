/**
 * Static-fallback detection.
 *
 * The scroll-scrub video experience is the premium path; the static fallback
 * (poster + stacked sections) is the PRIMARY experience for the target audience
 * (Vietnamese mobile data users, iOS Safari, reduced-motion, slow connections).
 *
 * Build the fallback FIRST and make sure it is complete before wiring the scrub.
 */

export function shouldUseFallback(): boolean {
  // 1. prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;

  // 2. iOS Safari — frame-accurate scrubbing is unreliable
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return true;

  // 3. saveData or slow connection
  const conn = (navigator as unknown as { connection?: NetworkInfo }).connection;
  if (conn) {
    if (conn.saveData) return true;
    const effectiveType = conn.effectiveType;
    if (effectiveType === '2g' || effectiveType === '3g' || effectiveType === 'slow-2g')
      return true;
  }

  return false;
}

interface NetworkInfo {
  saveData?: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
}

export function waitForVideoReady(
  video: HTMLVideoElement,
  timeoutMs = 3000
): Promise<boolean> {
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
