import { chromium } from 'playwright';

const EXEC = '/home/hal/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const URL = process.env.SMOKE_URL || 'http://localhost:4321/';
const SLUG = 'my-khe-beach-surf-guide';
let failures = 0;

const log = (...a) => console.log(...a);

async function newCtx(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...opts });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { failures++; log('  !! PAGE ERROR:', e.message); });
  page.on('console', (m) => { if (m.type() === 'error') { failures++; log('  !! CONSOLE ERROR:', m.text()); } });
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
  log('booking reachable:', await page.evaluate(() => !!document.querySelector('#dock-header a[href="#booking"]') && !!document.querySelector('#dock-header a[data-zalo]')));
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
  const q = (sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).display : 'absent'; };
  log('EN hidden:', await page.evaluate((sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).display : 'absent'; }, '#intro-open span[data-lang="en"]'));
  log('zalo btn visible:', await page.evaluate((sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).display : 'absent'; }, '#dock-header a[data-zalo]'));
  log('cal btn hidden:', await page.evaluate((sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).display : 'absent'; }, '#dock-header a[href="#booking"] [data-lang="en"]'));
  await ctx.close();
}

// ---------- 6. BLOG ----------
log('\n=== 6. BLOG ===');
const BLOG = [
  { path: 'blog/', lang: 'en', post: false },
  { path: `blog/${SLUG}/`, lang: 'en', post: true },
  { path: 'blog/vi/', lang: 'vi', post: false },
  { path: `blog/vi/${SLUG}/`, lang: 'vi', post: true },
];
const check = (name, ok) => { log(`  ${ok ? 'ok ' : 'FAIL'} ${name}`); if (!ok) failures++; };
for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
  for (const b of BLOG) {
    const { ctx, page } = await newCtx(browser, { viewport: vp });
    // pre-set the OPPOSITE language so the lock is actually exercised
    await ctx.addInitScript((l) => localStorage.setItem('nhi-lang', l), b.lang === 'vi' ? 'en' : 'vi');
    const res = await page.goto(URL + b.path, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const s = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      stored: localStorage.getItem('nhi-lang'),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
      hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => `${l.hreflang}=${l.href}`),
      jsonld: document.querySelectorAll('script[type="application/ld+json"]').length,
      toggle: document.querySelector('header a[hreflang]')?.getAttribute('href') ?? null,
      footerVi: getComputedStyle(document.querySelector('footer [data-lang="vi"]')).display,
      h1: document.querySelector('h1')?.textContent?.trim().slice(0, 40),
    }));
    log(`  ${vp.width}px ${b.path}`, JSON.stringify(s));
    check(`${b.path} status 200`, res?.status() === 200);
    check(`${b.path} html lang=${b.lang}`, s.lang === b.lang);
    check(`${b.path} persisted nhi-lang`, s.stored === b.lang);
    check(`${b.path} no horizontal overflow @${vp.width}`, s.overflow <= 0);
    check(`${b.path} canonical`, s.canonical === `https://nhilocal.com/${b.path}`);
    check(`${b.path} hreflang en+vi+x-default absolute`, s.hreflang.length === 3 && s.hreflang.every((h) => h.includes('https://nhilocal.com/')));
    check(`${b.path} footer follows page lang`, s.footerVi === (b.lang === 'vi' ? 'inline' : 'none'));
    if (b.post) check(`${b.path} BlogPosting JSON-LD`, s.jsonld >= 1);
    check(`${b.path} toggle href`, s.toggle === (b.post ? (b.lang === 'en' ? `/blog/vi/${SLUG}/` : `/blog/${SLUG}/`) : (b.lang === 'en' ? '/blog/vi/' : '/blog/')));
    if (vp.width === 390) await page.screenshot({ path: `.claude/artifacts/shots/${b.lang}-${b.post ? 'post' : 'index'}-390.png`, fullPage: false });
    // homepage must follow the reader's last blog language
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    check(`${b.path} → homepage lang`, (await page.evaluate(() => document.documentElement.lang)) === b.lang);
    await ctx.close();
  }
}
// sitemap + rss served
for (const f of ['sitemap.xml', 'rss.xml']) {
  const { ctx, page } = await newCtx(browser);
  const r = await page.goto(URL + f);
  const body = await r.text();
  check(`${f} 200`, r.status() === 200);
  check(`${f} lists the post`, body.includes(`/blog/${SLUG}/`));
  if (f === 'sitemap.xml') check('sitemap has VI post', body.includes(`/blog/vi/${SLUG}/`));
  await ctx.close();
}

await browser.close();
process.exit(failures ? 1 : 0);
