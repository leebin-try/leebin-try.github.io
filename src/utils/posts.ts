import { getCollection, type CollectionEntry } from 'astro:content';
export type Post = CollectionEntry<'posts'>;
export function coverSource(post: Post): string {
  return post.data.coverImage ?? `/art/${post.data.cover}.svg`;
}
export function coverAlt(post: Post): string {
  return post.data.coverAlt ?? `${post.data.title}的抽象几何封面`;
}

export async function getPosts(): Promise<Post[]> {
  return (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(date).replaceAll('-', '.');
}
export function readingTime(body: string | undefined): string {
  const text = body || '';
  const chinese = text.match(/[\u4e00-\u9fff]/g)?.length || 0;
  const words = text.replace(/[\u4e00-\u9fff]/g, ' ').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(chinese / 350 + words / 220))} 分钟阅读`;
}
