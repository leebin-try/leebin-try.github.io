import type { APIRoute } from 'astro';
import { getPosts, postPath } from '@/utils/posts';
import { localeOf, label } from '@/utils/i18n';
export const GET: APIRoute = async ({ url }) => {
  const locale = localeOf(url.pathname);
  const posts = await getPosts(locale);
  return new Response(JSON.stringify(posts.map(post => ({ title: post.data.title, description: post.data.description, category: label(post.data.category,locale), tags: post.data.tags, url: postPath(post) }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
