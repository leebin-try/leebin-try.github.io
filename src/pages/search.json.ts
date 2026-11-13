import type { APIRoute } from 'astro';
import { getPosts } from '@/utils/posts';
export const GET: APIRoute = async () => {
  const posts = await getPosts();
  return new Response(JSON.stringify(posts.map(post => ({ title: post.data.title, description: post.data.description, category: post.data.category, tags: post.data.tags, url: `/posts/${post.id}/` }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
