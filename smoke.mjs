import { chromium } from 'playwright';

const EXEC = '/home/hal/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const URL = 'http://localhost:4321/nhi-local/';

const log = (...a) => console.log(...a);

async function newCtx(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...opts });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => log('  !! PAGE ERROR:', e.message));
  page.on('console', (m) => m.type() === 'error' && log('  !! CONSOLE ERROR:', m.text()));
  return { ctx, page };
}

const state = (page) =>
  page.evaluate(() => {
    const on = (id) => document.getElementById(id)?.classList.contains('is-on') ?? null;
    const vis = (id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const s = getComputedStyle(el);
      return `${s.display}/${s.visibility}/${(+s.opacity).toFixed(2)}`;
    };
    const v = document.getElementById('hero-video');
    return {
      htmlClass: document.documentElement.className,
      canScroll: document.documentElement.scrollHeight > window.innerHeight + 10 &&
                 getComputedStyle(document.body).overflow !== 'hidden',
      bodyOverflow: getComputedStyle(document.body).overflow,
      heroH: document.getElementById('hero-section')?.getBoundingClientRect().height,
      winH: window.innerHeight,
      beats: { open: on('intro-open'), mid: on('intro-mid'), brand: on('intro-brand') },
      header: vis('dock-header'),
      brandVis: vis('intro-brand'),
      skipVis: vis('skip-intro'),
      staticCopy: vis('hero-section') && (() => {
        const el = document.querySelector('.static-only');
        const s = getComputedStyle(el);
        return `${s.display}/${s.visibility}/${(+s.opacity).toFixed(2)}`;
      })(),
      video: v ? { paused: v.paused, t: +v.currentTime.toFixed(2), dur: +(v.duration || 0).toFixed(2), muted: v.muted } : null,
    };
  });

const browser = await chromium.launch({ executablePath: EXEC, args: ['--autoplay-policy=no-user-gesture-required'] });

// ---------- 1. Happy path ----------
log('\n=== 1. NORMAL PATH ===');
{
  const { ctx, page } = await newCtx(browser);
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  log('t=0.3s ', JSON.stringify(await state(page)));
  await page.waitForTimeout(2000);
  log('t=2.3s ', JSON.stringify(await state(page)));
  await page.waitForTimeout(3000);
  log('t=5.3s ', JSON.stringify(await state(page)));
  await page.waitForTimeout(4500);
  log('t=9.8s ', JSON.stringify(await state(page)));
  // scroll after intro
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(500);
  log('after scroll: y=', await page.evaluate(() => window.scrollY));
  log('booking reachable:', await page.evaluate(() => !!document.querySelector('#dock-header [data-cal-link]') && !!document.querySelector('#dock-header a[data-zalo]')));
  await ctx.close();
}

// ---------- 2. Skip ----------
log('\n=== 2. SKIP INTRO ===');
{
  const { ctx, page } = await newCtx(browser);
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  log('locked before skip:', (await state(page)).bodyOverflow);
  await page.click('#skip-intro');
  await page.waitForTimeout(800);
  const s = await state(page);
  log('after skip:', JSON.stringify(s));
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(400);
  log('scrollY after skip+wheel:', await page.evaluate(() => window.scrollY));
  await ctx.close();
}

// ---------- 3. Reduced motion ----------
log('\n=== 3. REDUCED MOTION ===');
{
  const { ctx, page } = await newCtx(browser, { reducedMotion: 'reduce' });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const s = await state(page);
  log(JSON.stringify(s));
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(400);
  log('scrollY:', await page.evaluate(() => window.scrollY));
  log('video src cleared:', await page.evaluate(() => {
    const v = document.getElementById('hero-video');
    return { src: v.getAttribute('src'), sources: v.querySelectorAll('source').length, autoplay: v.hasAttribute('autoplay') };
  }));
  await ctx.close();
}

// ---------- 4. Video 404 ----------
log('\n=== 4. VIDEO UNAVAILABLE ===');
{
  const { ctx, page } = await newCtx(browser);
  await page.route('**/hero_danang_sup.mp4', (r) => r.abort());
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(5200);
  const s = await state(page);
  log(JSON.stringify(s));
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(400);
  log('scrollY:', await page.evaluate(() => window.scrollY));
  await ctx.close();
}

// ---------- 5. Vietnamese ----------
log('\n=== 5. VIETNAMESE ===');
{
  const { ctx, page } = await newCtx(browser);
  await page.goto(URL + '?lang=vi', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  log('lang:', await page.evaluate(() => document.documentElement.lang));
  log('open beat text:', JSON.stringify(await page.evaluate(() => {
    const el = document.querySelector('#intro-open span[data-lang="vi"]');
    return el ? el.textContent : null;
  })));
  log('EN hidden:', await page.evaluate(() => getComputedStyle(document.querySelector('#intro-open span[data-lang="en"]')).display));
  log('zalo btn visible:', await page.evaluate(() => getComputedStyle(document.querySelector('#dock-header a[data-zalo]')).display));
  log('cal btn hidden:', await page.evaluate(() => getComputedStyle(document.querySelector('#dock-header button[data-cal-link]')).display));
  await ctx.close();
}

await browser.close();
