import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '@/utils/posts';
import { SITE } from '@/config';
export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({ title: SITE.name, description: SITE.description, site: context.site ?? 'https://leebin-try.github.io', customData: '<language>zh-cn</language>', items: posts.map(post => ({ title: post.data.title, pubDate: post.data.date, description: post.data.description, link: `/posts/${post.id}/` })) });
}
