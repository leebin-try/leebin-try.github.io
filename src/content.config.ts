import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['技术', '设计', '生活']),
    tags: z.array(z.string()),
    cover: z.enum(['garden', 'terminal', 'design', 'coffee', 'workflow', 'slow']),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    sample: z.boolean().default(true),
  }),
});

export const collections = { posts };
