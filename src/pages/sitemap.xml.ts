import type { APIRoute } from 'astro';
import { allPosts, langOf, slugOf, pairOf, postPath, indexPath, absUrl, isoDate } from '../lib/blog';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const alt = (hreflang: string, href: string) =>
  `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${esc(href)}" />`;
const url = (lines: string[]) => ['  <url>', ...lines, '  </url>'].join('\n');

export const GET: APIRoute = async () => {
  const home = absUrl(import.meta.env.BASE_URL);
  const en = absUrl(indexPath('en')), vi = absUrl(indexPath('vi'));
  const entries = [
    // homepage entry identical to the old public/sitemap.xml
    url([`    <loc>${home}</loc>`, alt('en', home), alt('vi', `${home}?lang=vi`),
         '    <changefreq>monthly</changefreq>', '    <priority>1.0</priority>']),
    url([`    <loc>${en}</loc>`, alt('en', en), alt('vi', vi), alt('x-default', en)]),
    url([`    <loc>${vi}</loc>`, alt('en', en), alt('vi', vi), alt('x-default', en)]),
  ];
  for (const p of await allPosts()) {
    const self = absUrl(postPath(langOf(p), slugOf(p)));
    const pair = await pairOf(p);
    const pairUrl = pair ? absUrl(postPath(langOf(pair), slugOf(pair))) : undefined;
    const enUrl = langOf(p) === 'en' ? self : pairUrl;
    const viUrl = langOf(p) === 'vi' ? self : pairUrl;
    const lines = [`    <loc>${self}</loc>`, `    <lastmod>${isoDate(p.data.updatedDate ?? p.data.pubDate)}</lastmod>`];
    if (enUrl) lines.push(alt('en', enUrl));
    if (viUrl) lines.push(alt('vi', viUrl));
    lines.push(alt('x-default', (enUrl ?? viUrl)!));
    entries.push(url(lines));
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
