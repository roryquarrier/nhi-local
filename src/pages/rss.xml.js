import { COPY } from '../lib/translations';
import { postsIn, slugOf, postPath, indexPath, absUrl } from '../lib/blog';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET() {
  const base = import.meta.env.BASE_URL;
  const items = (await postsIn('en')).map((p) => {
    const link = absUrl(postPath('en', slugOf(p)));
    return `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${esc(p.data.description)}</description>
      <pubDate>${p.data.pubDate.toUTCString()}</pubDate>
    </item>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nhi Local Blog</title>
    <link>${absUrl(indexPath('en'))}</link>
    <atom:link href="${absUrl(`${base}rss.xml`)}" rel="self" type="application/rss+xml" />
    <description>${esc(COPY.en.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
