/**
 * Static-fallback detection.
 *
 * The autoplay intro video is the premium path; the static fallback
 * (poster + stacked sections, scroll unlocked immediately) is the PRIMARY
 * experience for reduced-motion users and for anyone on metered or slow data.
 *
 * NOTE: iOS Safari is NOT excluded. The old scroll-scrub needed frame-accurate
 * seeking, which iOS does badly. Normal playback of a muted + playsinline video
 * autoplays fine on iOS, so there is no reason to ban it here.
 */

export function shouldUseFallback(): boolean {
  // 1. prefers-reduced-motion — no autoplaying motion at all.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;

  // 2. saveData or slow connection — don't pull megabytes of video down 3G.
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

/**
 * Wait until the video is buffered end-to-end, not merely playable.
 *
 * readyState >= 2 only means "first frame decoded", which on 4G lets playback
 * start and then outrun the download — the video stalls mid-intro. Since the
 * clip is ~8s and a couple of MB, we wait for the whole thing and only then
 * commit to playing it.
 *
 * Resolves `true` on timeout (caller should fall back), `false` when buffered.
 */
export function waitForFullBuffer(
  video: HTMLVideoElement,
  timeoutMs = 4000
): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;

    const isFullyBuffered = () => {
      const { buffered, duration } = video;
      if (!duration || !isFinite(duration) || buffered.length === 0) return false;
      return buffered.end(buffered.length - 1) >= duration - 0.1;
    };

    const finish = (timedOut: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      video.removeEventListener('progress', check);
      video.removeEventListener('canplaythrough', check);
      video.removeEventListener('loadedmetadata', check);
      resolve(timedOut);
    };

    const check = () => {
      if (isFullyBuffered()) finish(false);
    };

    const timer = setTimeout(() => finish(true), timeoutMs);

    if (isFullyBuffered()) {
      finish(false);
      return;
    }

    video.addEventListener('progress', check);
    video.addEventListener('canplaythrough', check);
    video.addEventListener('loadedmetadata', check);
    video.load();
  });
}
