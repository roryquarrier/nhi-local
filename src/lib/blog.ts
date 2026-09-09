import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './translations';

export type Post = CollectionEntry<'blog'>;
const base = import.meta.env.BASE_URL;                   // '/'
const RESERVED = new Set(['vi']);                        // /blog/vi/ is the VI index

export const langOf = (p: Post): Lang => p.id.split('/')[1] as Lang;
export const slugOf = (p: Post): string => p.id.split('/')[0];
export const otherLang = (l: Lang): Lang => (l === 'en' ? 'vi' : 'en');
export const indexPath = (l: Lang) => (l === 'vi' ? `${base}blog/vi/` : `${base}blog/`);
export const postPath = (l: Lang, slug: string) => `${indexPath(l)}${slug}/`;
export const absUrl = (path: string) => new URL(path, import.meta.env.SITE).href;
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function formatDate(d: Date, l: Lang) {
  const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
  return l === 'vi' ? `${day}/${m + 1}/${y}` : `${day} ${MONTHS[m]} ${y}`;
}
export const readingMinutes = (p: Post) =>
  Math.max(1, Math.round((p.body ?? '').split(/\s+/).filter(Boolean).length / 200));

let cache: Post[] | undefined;
export async function allPosts(): Promise<Post[]> {
  if (cache && import.meta.env.PROD) return cache;
  const posts = await getCollection('blog', ({ data }) => !data.draft || import.meta.env.DEV);
  for (const p of posts) {
    const [slug, file, extra] = p.id.split('/');
    if (extra !== undefined || (file !== 'en' && file !== 'vi'))
      throw new Error(`blog: "${p.id}" must be src/content/blog/<slug>/en.md or vi.md`);
    if (p.data.lang !== file)
      throw new Error(`blog: "${p.id}" frontmatter lang "${p.data.lang}" does not match file name`);
    if (RESERVED.has(slug)) throw new Error(`blog: slug "${slug}" is reserved`);
    if (p.data.pair && !posts.some((q) => q.id === `${p.data.pair}/${otherLang(file)}`))
      throw new Error(`blog: "${p.id}" declares pair "${p.data.pair}" but ${p.data.pair}/${otherLang(file)}.md is missing or draft`);
  }
  cache = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return cache;
}
export async function postsIn(l: Lang) { return (await allPosts()).filter((p) => langOf(p) === l); }
export async function pairOf(p: Post): Promise<Post | undefined> {
  if (!p.data.pair) return undefined;
  return (await allPosts()).find((q) => q.id === `${p.data.pair}/${otherLang(langOf(p))}`);
}
