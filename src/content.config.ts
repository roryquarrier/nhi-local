import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '*/{en,vi}.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    lang: z.enum(['en', 'vi']),
    /** slug of this post's translation (the folder name of the other-language file). */
    pair: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
