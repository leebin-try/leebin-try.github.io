const isChinese = document.documentElement.lang.startsWith('zh');
const t = (zh: string, en: string): string => isChinese ? zh : en;

interface SearchPost { title: string; description: string; category: string; tags: string[]; url: string; }

const themeButtons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
function updateThemeLabels(): void {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButtons.forEach(button => button.setAttribute('aria-label', dark ? t('切换到浅色模式','Switch to light mode') : t('切换到深色模式','Switch to dark mode')));
}
themeButtons.forEach(button => button.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('bin-journal-theme', theme); } catch { /* Storage can be disabled. */ }
  updateThemeLabels();
}));
updateThemeLabels();

const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const mobileNav = document.querySelector<HTMLElement>('#mobile-navigation');
menuButton?.addEventListener('click', () => {
  if (!mobileNav) return;
  mobileNav.hidden = !mobileNav.hidden;
  menuButton.setAttribute('aria-expanded', String(!mobileNav.hidden));
  menuButton.setAttribute('aria-label', mobileNav.hidden ? t('打开导航','Open navigation') : t('关闭导航','Close navigation'));
});

const filterButtons = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
const cards = document.querySelectorAll<HTMLElement>('[data-post-card]');
filterButtons.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  let visible = 0;
  cards.forEach(card => {
    card.hidden = category !== '全部' && card.dataset.category !== category;
    if (!card.hidden) visible++;
  });
  filterButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  const empty = document.querySelector<HTMLElement>('.filter-empty');
  if (empty) empty.hidden = visible !== 0;
}));

const dialog = document.querySelector<HTMLDialogElement>('#search-dialog');
const input = document.querySelector<HTMLInputElement>('#search-input');
const results = document.querySelector<HTMLElement>('#search-results');
let posts: SearchPost[] | undefined;
let loading: Promise<SearchPost[]> | undefined;
async function loadIndex(): Promise<SearchPost[]> {
  if (posts) return posts;
  loading ??= fetch(isChinese ? '/zh/search.json' : '/search.json').then(response => {
    if (!response.ok) throw new Error('Search index unavailable');
    return response.json() as Promise<SearchPost[]>;
  }).then(data => { posts = data; return data; }).catch(error => { loading = undefined; throw error; });
  return loading;
}
function showMessage(message: string): void {
  if (!results) return;
  const paragraph = document.createElement('p');
  paragraph.className = 'search-hint';
  paragraph.textContent = message;
  results.replaceChildren(paragraph);
}
async function search(): Promise<void> {
  const query = input?.value.trim().toLowerCase() ?? '';
  if (!query) { showMessage(t('输入关键词，找回一个想法。','Type a keyword to find an idea.')); return; }
  try {
    const index = await loadIndex();
    if (input?.value.trim().toLowerCase() !== query) return;
    const terms = query.split(/\s+/);
    const found = index.filter(post => terms.every(term => `${post.title} ${post.description} ${post.category} ${post.tags.join(' ')}`.toLowerCase().includes(term)));
    if (!found.length) { showMessage(t('还没有找到相关内容，试试“设计”或“终端”。','No articles found. Try another keyword.')); return; }
    const links = found.map(post => {
      const link = document.createElement('a');
      link.className = 'search-result'; link.href = post.url;
      const title = document.createElement('strong'); title.textContent = post.title;
      const description = document.createElement('span'); description.textContent = `${post.category} / ${post.description}`;
      link.append(title, description);
      return link;
    });
    results?.replaceChildren(...links);
  } catch { showMessage(t('搜索暂时不可用，请稍后再试。','Search is unavailable. Please try again later.')); }
}
function openSearch(): void { if (dialog && !dialog.open) { dialog.showModal(); input?.focus(); void loadIndex().catch(() => undefined); } }
document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', openSearch));
document.querySelector('[data-search-close]')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
input?.addEventListener('input', () => { void search(); });
input?.addEventListener('keydown', event => { if (event.key === 'Enter') results?.querySelector<HTMLAnchorElement>('a')?.click(); });
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); } });

document.querySelector<HTMLButtonElement>('[data-copy-link]')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  if (!(button instanceof HTMLButtonElement)) return;
  try { await navigator.clipboard.writeText(window.location.href); button.textContent = t('链接已复制 ✓','Link copied ✓'); button.classList.add('copy-feedback'); }
  catch { button.textContent = t('请复制浏览器地址栏中的链接','Copy the link from your address bar'); }
});

// Switching language retains the current page, filters and corresponding section.
function decodeFragment(value: string): string {
  try { return decodeURIComponent(value); } catch { return value; }
}
function syncLanguageLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-language]').forEach(link => {
    const url = new URL(link.href);
    url.search = location.search;
    const fragments = JSON.parse(link.dataset.fragments ?? '{}') as Record<string,string>;
    const hash = decodeFragment(location.hash.slice(1));
    url.hash = hash ? fragments[hash] ?? hash : '';
    link.href = url.href;
  });
}
syncLanguageLinks();
window.addEventListener('hashchange', syncLanguageLinks);
window.addEventListener('journal:locationchange', syncLanguageLinks);
document.querySelectorAll('a[data-language]').forEach(link => link.addEventListener('click', syncLanguageLinks));

// A sticky left outline on desktop; native anchors remain usable without JavaScript.
const content = document.querySelector('[data-reading-content]');
const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
tocLinks.forEach(link => link.addEventListener('click', event => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = document.getElementById(decodeFragment(link.hash.slice(1)));
  if (!target) return;
  event.preventDefault();
  const oldURL = location.href;
  if (location.hash !== link.hash) history.pushState(null,'',link.hash);
  // Avoid competing native smooth-scroll and mobile focus restoration.
  // The anchor remains a normal shareable link when JavaScript is unavailable.
  target.setAttribute('tabindex','-1');
  target.focus({ preventScroll:true });
  target.scrollIntoView({ block:'start', behavior:'instant' });
  window.dispatchEvent(new HashChangeEvent('hashchange',{oldURL,newURL:location.href}));
}));
const tocIds = new Set(tocLinks.map(link => decodeFragment(link.hash.slice(1))));
const headings = Array.from(content?.querySelectorAll<HTMLElement>('h1, h2, h3') ?? [])
  .filter(heading => tocIds.has(heading.id || heading.closest('[id]')?.id || ''));
let scheduled = false;
function updateCurrentSection(): void {
  scheduled = false;
  if (!headings.length) return;
  let current = headings[0];
  if (!current) return;
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= 112) current = heading;
    else break;
  }
  const id = current.id || current.closest('[id]')?.id;
  tocLinks.forEach(link => {
    if (decodeFragment(link.hash.slice(1)) === id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function scheduleCurrentSection(): void {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateCurrentSection); }
}
window.addEventListener('scroll', scheduleCurrentSection, { passive:true });
window.addEventListener('resize', scheduleCurrentSection);
window.addEventListener('hashchange', scheduleCurrentSection);
updateCurrentSection();
