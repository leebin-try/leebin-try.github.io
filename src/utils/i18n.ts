export type Locale = 'en' | 'zh';
export function localeOf(pathname: string): Locale {
  return pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh' : 'en';
}
export function localPath(path: string, locale: Locale): string {
  const url = new URL(path, 'https://leebin-try.github.io');
  if (url.origin !== 'https://leebin-try.github.io') return path;
  const clean = url.pathname.replace(/^\/zh(?=\/|$)/, '') || '/';
  return `${locale === 'zh' ? '/zh' : ''}${clean}${url.search}${url.hash}`;
}
export function translator(locale: Locale) {
  return (zh: string, en: string): string => locale === 'zh' ? zh : en;
}
const names: Record<string, string> = {
  '全部': 'All', '技术': 'Technology', '设计': 'Design', '生活': 'Life', 'Kaggle': 'Kaggle',
  '表格学习': 'Tabular learning', '时序与推荐': 'Time series & recommendations',
  '图像分类': 'Image classification', '图像分割': 'Image segmentation',
  '语言模型': 'Language models', '智能体': 'Agents',
  '已出分': 'Scored', '验证受阻': 'Evaluation blocked', '尚未出分': 'Not scored',
};
export function label(value: string, locale: Locale): string {
  return locale === 'zh' ? value : names[value] ?? value;
}
