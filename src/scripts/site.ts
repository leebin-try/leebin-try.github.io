interface SearchPost { title: string; description: string; category: string; tags: string[]; url: string; }

const themeButtons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
function updateThemeLabels(): void {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButtons.forEach(button => button.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式'));
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
  menuButton.setAttribute('aria-label', mobileNav.hidden ? '打开导航' : '关闭导航');
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
  loading ??= fetch('/search.json').then(response => {
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
  if (!query) { showMessage('输入关键词，找回一个想法。'); return; }
  try {
    const index = await loadIndex();
    if (input?.value.trim().toLowerCase() !== query) return;
    const terms = query.split(/\s+/);
    const found = index.filter(post => terms.every(term => `${post.title} ${post.description} ${post.category} ${post.tags.join(' ')}`.toLowerCase().includes(term)));
    if (!found.length) { showMessage('还没有找到相关内容，试试“设计”或“终端”。'); return; }
    const links = found.map(post => {
      const link = document.createElement('a');
      link.className = 'search-result'; link.href = post.url;
      const title = document.createElement('strong'); title.textContent = post.title;
      const description = document.createElement('span'); description.textContent = `${post.category} / ${post.description}`;
      link.append(title, description);
      return link;
    });
    results?.replaceChildren(...links);
  } catch { showMessage('搜索暂时不可用，请稍后再试。'); }
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
  try { await navigator.clipboard.writeText(window.location.href); button.textContent = '链接已复制 ✓'; button.classList.add('copy-feedback'); }
  catch { button.textContent = '请复制浏览器地址栏中的链接'; }
});
