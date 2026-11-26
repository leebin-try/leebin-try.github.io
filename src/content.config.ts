import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { KAGGLE_TOPICS } from './config';

const evidence = {
  source: z.url({ protocol: /^https$/ }),
  recordSource: z.url({ protocol: /^https$/ }),
  evidenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
};
const kaggle = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('case'), number: z.number().int().min(1),
    topic: z.enum(KAGGLE_TOPICS), status: z.enum(['已出分', '验证受阻', '尚未出分']),
    result: z.string(), competitionUrl: z.url({ protocol: /^https$/ }), submission: z.string().optional(), ...evidence }),
  z.object({ kind: z.literal('method'), ...evidence }),
]);

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    lang: z.enum(['en', 'zh']).default('zh'),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['技术', '设计', '生活', 'Kaggle', 'Math']),
    tags: z.array(z.string()),
    cover: z.enum(['garden', 'terminal', 'design', 'coffee', 'workflow', 'slow']),
    coverImage: z.string().regex(/^\/(?:kaggle|math)\/[a-z0-9-]+\/cover\.svg$/).optional(),
    coverAlt: z.string().optional(),
    coverCaption: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    sample: z.boolean().default(true),
    kaggle: kaggle.optional(),
    math: z.object({
      kind: z.literal('reading-guide'),
      topic: z.string(),
      evidenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      source: z.url({ protocol: /^https$/ }),
      verificationSource: z.url({ protocol: /^https$/ }),
      proofCommit: z.string().regex(/^[a-f0-9]{40}$/),
    }).optional(),
  }).refine(data => (data.category === 'Kaggle') === Boolean(data.kaggle), {
    message: 'Kaggle articles require structured case or method metadata.',
  }).refine(data => !data.kaggle || Boolean(data.coverImage && data.coverAlt && data.coverCaption), {
    message: 'Kaggle articles require a subject-specific cover, alt text and provenance caption.',
  }).refine(data => (data.category === 'Math') === Boolean(data.math), {
    message: 'Math articles require structured source and verification metadata.',
  }).refine(data => !data.math || Boolean(data.coverImage && data.coverAlt && data.coverCaption), {
    message: 'Math articles require a subject-specific cover, alternative text and provenance caption.',
  }),
});

export const collections = { posts };
