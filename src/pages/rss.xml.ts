import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postPath } from '@/utils/posts';
import { localeOf, translator } from '@/utils/i18n';
import { SITE } from '@/config';
export async function GET(context: APIContext) {
  const locale = localeOf(context.url.pathname);
  const posts = await getPosts(locale);
  const t = translator(locale);
  return rss({ title: SITE.name, description: t(SITE.description,'Notes on technology, design and everyday work.'), site: context.site ?? 'https://leebin-try.github.io', customData: `<language>${locale === 'zh' ? 'zh-cn' : 'en'}</language>`, items: posts.map(post => ({ title: post.data.title, pubDate: post.data.date, description: post.data.description, link: postPath(post) })) });
}
