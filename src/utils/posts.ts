import { getCollection, type CollectionEntry } from 'astro:content';
import { localPath, type Locale } from './i18n';
export type Post = CollectionEntry<'posts'>;
export function postKey(post: Post): string { return post.id.replace(/^en\//, ''); }
export function postPath(post: Post): string { return localPath(`/posts/${postKey(post)}/`, post.data.lang); }
export function coverSource(post: Post): string {
  return post.data.coverImage ?? `/art/${post.data.cover}.svg`;
}
export function coverAlt(post: Post): string {
  return post.data.coverAlt ?? (post.data.lang === 'zh' ? `${post.data.title}的抽象几何封面` : `Original geometric cover for ${post.data.title}`);
}

export async function getPosts(locale: Locale = 'en'): Promise<Post[]> {
  return (await getCollection('posts', ({ data }) => !data.draft && data.lang === locale))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(date).replaceAll('-', '.');
}
export function readingTime(body: string | undefined, locale: Locale = 'en'): string {
  const text = body || '';
  const chinese = text.match(/[\u4e00-\u9fff]/g)?.length || 0;
  const words = text.replace(/[\u4e00-\u9fff]/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(chinese / 350 + words / 220));
  return locale === 'zh' ? `${minutes} 分钟阅读` : `${minutes} min read`;
}
